import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadDocumentDto, DocumentResponseDto } from './dto/document.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    metadata?: Record<string, any>,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(this.uploadDir, filename);

    try {
      // Save file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Save document metadata to database
      const document = await this.prisma.document.create({
        data: {
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: `/uploads/${filename}`,
          metadata: metadata || null,
          status: 'active',
        },
      });

      return this.toDocumentResponse(document);
    } catch (error) {
      // Clean up file if database save fails
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      throw new BadRequestException('Failed to upload document: ' + error.message);
    }
  }

  private toDocumentResponse(document: any): DocumentResponseDto {
    return {
      id: document.id,
      filename: document.filename,
      mimetype: document.mimetype,
      size: document.size,
      url: document.url,
      metadata: document.metadata,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}
