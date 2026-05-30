import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConceptoDto {
  @ApiProperty({ example: 'Bonificación Incentivo', description: 'Nombre del concepto', required: false })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiProperty({ example: 'Bonificacion', description: 'Tipo del concepto', enum: ['Bonificacion', 'Comision', 'Deduccion', 'Descuento'], required: false })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  tipo?: string;

  @ApiProperty({ example: 0.05, description: 'Porcentaje sobre el salario', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  porcentaje?: number;

  @ApiProperty({ example: 500.00, description: 'Monto fijo', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_fijo?: number;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z', description: 'Fecha de aplicación', required: false })
  @IsOptional()
  fecha_aplica?: Date;
}