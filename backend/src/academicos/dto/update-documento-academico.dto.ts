import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentoAcademicoDto {
  @ApiProperty({ example: 'Titulo_Actualizado.pdf', description: 'Nuevo nombre del documento', required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ example: 'base64string...', description: 'Nuevo archivo en base64', required: false })
  @IsOptional()
  @IsString()
  archivo?: string;

  @ApiProperty({ example: 2, description: 'Nuevo tipo de documento académico', required: false })
  @IsOptional()
  @IsInt()
  id_tipo_doc_academico?: number;
}