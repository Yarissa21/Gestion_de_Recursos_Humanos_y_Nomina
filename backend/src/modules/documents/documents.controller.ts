import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { DocumentResponseDto } from './dto/document.dto';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() body?: any,
  ): Promise<{ message: string; data: DocumentResponseDto }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const metadata = body?.metadata ? JSON.parse(body.metadata) : undefined;
    const result = await this.documentsService.uploadDocument(file, metadata);

    return {
      message: 'Document uploaded successfully',
      data: result,
    };
  }
}
