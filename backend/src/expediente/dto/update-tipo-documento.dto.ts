import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTipoDocumentoDto {
  @ApiProperty({ example: 'Antecedentes Penales', description: 'Nuevo nombre del tipo de documento', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: false, description: 'Si el documento es obligatorio', required: false })
  @IsBoolean()
  @IsOptional()
  obligatorio?: boolean;
}