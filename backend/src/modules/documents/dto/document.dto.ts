export class UploadDocumentDto {
  filename: string;
  mimetype: string;
  size: number;
  metadata?: Record<string, any>;
}

export class DocumentResponseDto {
  id: number;
  filename: string;
  mimetype: string;
  size: number;
  url: string;
  metadata?: Record<string, any>;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
