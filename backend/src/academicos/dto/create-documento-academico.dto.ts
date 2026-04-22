import { IsString, IsNotEmpty, IsInt, IsDateString } from 'class-validator';

export class CreateDocumentoAcademicoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  archivo!: string; 

  @IsDateString()
  fecha_carga!: Date;

  @IsInt()
  id_academico!: number;

  @IsInt()
  id_tipo_doc_academico!: number;

  @IsInt()
  id_usuario!: number;
}