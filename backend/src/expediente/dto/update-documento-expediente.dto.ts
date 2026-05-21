import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateDocumentoExpedienteDto {
  @IsOptional()
  @IsString()
  nombre_documento?: string;

  @IsOptional()
  @IsString()
  archivo?: string;

  @IsOptional()
  @IsInt()
  id_tipo?: number;
}