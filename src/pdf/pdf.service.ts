import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as pdfParse from 'pdf-parse';

interface PdfTableRow {
  [key: string]: string;
}

interface PdfTable {
  headers: string[];
  rows: PdfTableRow[];
}

interface PdfParseResult {
  text: string;
  tables: PdfTable[];
  metadata?: {
    pages: number;
    [key: string]: any;
  };
}

@Injectable()
export class PdfService {
  async parsePdfToTable(filePath: string): Promise<PdfParseResult> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const { text, metadata } = await pdfParse(dataBuffer);
      
      const tables = this.detectTablesAdvanced(text);
      
      return {
        text,
        tables,
        metadata: {
          pages: metadata?.numpages || 1,
          ...metadata
        }
      };
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }

  private detectTablesAdvanced(text: string): PdfTable[] {
    const tables: PdfTable[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return tables;

    const potentialTables = this.findPotentialTables(lines);
    
    const columnBasedTables = this.findColumnAlignedTables(lines);
    
    return [...potentialTables, ...columnBasedTables].filter(table => 
      table.headers.length > 0 && table.rows.length > 0
    );
  }

  private findPotentialTables(lines: string[]): PdfTable[] {
    const tables: PdfTable[] = [];
    let currentTable: string[] = [];
    let inTable = false;

    for (const line of lines) {
      if (this.isPotentialHeader(line) && !inTable) {
        inTable = true;
        currentTable = [line];
        continue;
      }

      if (inTable) {
        if (line.trim() === '' || !this.isTableRow(line)) {
          if (currentTable.length >= 2) {
            const table = this.extractTable(currentTable);
            if (table.headers.length > 0) {
              tables.push(table);
            }
          }
          inTable = false;
          currentTable = [];
        } else {
          currentTable.push(line);
        }
      }
    }

    if (inTable && currentTable.length >= 2) {
      const table = this.extractTable(currentTable);
      if (table.headers.length > 0) {
        tables.push(table);
      }
    }

    return tables;
  }

  private findColumnAlignedTables(lines: string[]): PdfTable[] {
    const tables: PdfTable[] = [];
    const columnPositions = this.detectColumnPositions(lines);

    if (columnPositions.length > 1) {
      const tableLines = lines.filter(line => 
        this.countColumnAlignments(line, columnPositions) >= columnPositions.length - 1
      );

      if (tableLines.length >= 2) {
        const table = this.extractTableWithColumns(tableLines, columnPositions);
        if (table.headers.length > 0) {
          tables.push(table);
        }
      }
    }

    return tables;
  }

  private detectColumnPositions(lines: string[]): number[] {
    const columnPositions = new Set<number>();
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i];
      let pos = 0;
      
      let inText = false;
      for (let j = 0; j < line.length; j++) {
        if (line[j] !== ' ' && !inText) {
          columnPositions.add(j);
          inText = true;
        } else if (line[j] === ' ' && inText) {
          inText = false;
        }
      }
    }

    return Array.from(columnPositions).sort((a, b) => a - b);
  }

  private countColumnAlignments(line: string, positions: number[]): number {
    let count = 0;
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] < line.length && line[positions[i]] !== ' ') {
        count++;
      }
    }
    return count;
  }

  private extractTableWithColumns(lines: string[], positions: number[]): PdfTable {
    const headers = this.splitLineByPositions(lines[0], positions);
    const rows: PdfTableRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitLineByPositions(lines[i], positions);
      const row: PdfTableRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });
      
      rows.push(row);
    }

    return {
      headers: headers.map(h => h.trim()),
      rows
    };
  }

  private splitLineByPositions(line: string, positions: number[]): string[] {
    const parts: string[] = [];
    for (let i = 0; i < positions.length; i++) {
      const start = positions[i];
      const end = i < positions.length - 1 ? positions[i + 1] : line.length;
      parts.push(line.slice(start, end));
    }
    return parts;
  }

  private isPotentialHeader(line: string): boolean {
    const parts = line.split(/\s{2,}/).filter(p => p.trim());
    return parts.length >= 3;
  }

  private isTableRow(line: string): boolean {
    const parts = line.split(/\s{2,}/).filter(p => p.trim());
    return parts.length >= 2;
  }

  private extractTable(lines: string[]): PdfTable {
    const separators = [/\s{2,}/, /\t/, /\|/];
    let bestHeaders: string[] = [];
    let bestRows: PdfTableRow[] = [];
    
    for (const separator of separators) {
      try {
        const headers = lines[0].split(separator).map(h => h.trim()).filter(h => h);
        const rows: PdfTableRow[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(separator).map(v => v.trim());
          const row: PdfTableRow = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          rows.push(row);
        }
        
        if (headers.length > bestHeaders.length) {
          bestHeaders = headers;
          bestRows = rows;
        }
      } catch (e) {
        continue;
      }
    }

    return {
      headers: bestHeaders,
      rows: bestRows
    };
  }
}