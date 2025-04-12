// src/pdf/pdf.types.ts
export interface BulletinItem {
    type: 'subsection' | 'content';
    content: string;
  }
  
  export interface BulletinStructure {
    type: 'section';
    title: string;
    items: BulletinItem[];
  }
  
  export interface TableRow {
    [key: string]: string;
  }
  
  export interface DetectedTable {
    headers: string[];
    rows: TableRow[];
  }
  
  export interface BulletinParseResult {
    rawText: string;
    structuredData: BulletinStructure[];
    tables: DetectedTable[];
  }