import { IsOptional, IsString, IsInt } from 'class-validator';

export class UpdateDocumentoAcademicoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  archivo?: string;

  @IsOptional()
  @IsInt()
  id_tipo_doc_academico?: number;
}