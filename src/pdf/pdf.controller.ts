import { Controller, Post, UploadedFile, UseInterceptors, Logger, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

interface PdfScanResponse {
  success: boolean;
  filename: string;
  pages?: number;
  tables: {
    headers: string[];
    rows: Array<{[key: string]: string}>;
  }[];
  text?: string;
  error?: string;
}

@Controller('pdf')
export class PdfController {
  private readonly logger = new Logger(PdfController.name);

  constructor(private readonly pdfService: PdfService) {}

  @Post('scan')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './temp',
      filename: (req, file, cb) => {
        if (!fs.existsSync('./temp')) {
          fs.mkdirSync('./temp', { recursive: true });
        }
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.parse(file.originalname).ext;
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf)$/i)) {
        return cb(new BadRequestException('Only PDF files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  }))
  async scanPdf(@UploadedFile() file: Express.Multer.File): Promise<PdfScanResponse> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    this.logger.log(`Processing file: ${file.originalname}`);
    
    try {
      const result = await this.pdfService.parsePdfToTable(file.path);
      
      fs.unlinkSync(file.path);
      
      return {
        success: true,
        filename: file.originalname,
        pages: result.metadata?.pages,
        tables: result.tables,
        text: result.text
      };
    } catch (error) {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      this.logger.error(`PDF processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        filename: file.originalname,
        tables: [],
        error: error.message
      };
    }
  }
}