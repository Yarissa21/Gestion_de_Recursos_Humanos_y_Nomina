import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoDocumentoAcademicoDto {
  @ApiProperty({ example: 'Título Universitario', description: 'Nombre del tipo de documento académico' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: true, description: 'Indica si el documento es obligatorio para el expediente académico' })
  @IsBoolean()
  obligatorio!: boolean;
}