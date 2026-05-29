import { IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDocumentoExpedienteDto {
  @ApiProperty({ example: 'DPI_Actualizado.pdf', description: 'Nuevo nombre del documento', required: false })
  @IsOptional()
  @IsString()
  nombre_documento?: string;

  @ApiProperty({ example: 'base64string...', description: 'Nuevo archivo en base64', required: false })
  @IsOptional()
  @IsString()
  archivo?: string;

  @ApiProperty({ example: 2, description: 'Nuevo ID del tipo de documento', required: false })
  @IsOptional()
  @IsInt()
  id_tipo?: number;
}