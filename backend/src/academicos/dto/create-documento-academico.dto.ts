import { IsString, IsNotEmpty, IsInt, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentoAcademicoDto {
  @ApiProperty({ example: 'Titulo_Juan_Perez.pdf', description: 'Nombre del documento académico' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: 'base64string...', description: 'Archivo en formato base64' })
  @IsString()
  @IsNotEmpty()
  archivo!: string;

  @ApiProperty({ example: '2026-05-29T12:00:00.000Z', description: 'Fecha de carga del documento' })
  @IsDateString()
  fecha_carga!: Date;

  @ApiProperty({ example: 1, description: 'ID del registro de información académica' })
  @IsInt()
  id_academico!: number;

  @ApiProperty({ example: 1, description: 'ID del tipo de documento académico' })
  @IsInt()
  id_tipo_doc_academico!: number;

  @ApiProperty({ example: 1, description: 'ID del usuario que sube el documento' })
  @IsInt()
  id_usuario!: number;
}