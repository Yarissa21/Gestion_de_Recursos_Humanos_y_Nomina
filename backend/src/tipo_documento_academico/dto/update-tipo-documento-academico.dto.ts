import { IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTipoDocumentoAcademicoDto {
  @ApiProperty({ example: 'Diploma de Graduación', description: 'Nuevo nombre del tipo de documento académico', required: false })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiProperty({ example: false, description: 'Si el documento es obligatorio', required: false })
  @IsOptional()
  @IsBoolean()
  obligatorio?: boolean;
}