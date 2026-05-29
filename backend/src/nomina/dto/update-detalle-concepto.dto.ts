import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDetalleConceptoDto {
  @ApiProperty({ example: 250.00, description: 'Nuevo monto del concepto (solo para conceptos manuales)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto?: number;
}