import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConceptoDto {
  @ApiProperty({ example: 'IGSS', description: 'Nombre del concepto de nómina' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'Deduccion', description: 'Tipo del concepto', enum: ['Bonificacion', 'Comision', 'Deduccion', 'Descuento'] })
  @IsString()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  tipo!: string;

  @ApiProperty({ example: 0.0483, description: 'Porcentaje a aplicar sobre el salario (ej: 0.0483 = 4.83%). Solo uno de los tres campos opcionales', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  porcentaje?: number;

  @ApiProperty({ example: 250.00, description: 'Monto fijo a aplicar. Solo uno de los tres campos opcionales', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_fijo?: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z', description: 'Fecha de aplicación. Solo uno de los tres campos opcionales', required: false })
  @IsOptional()
  fecha_aplica?: Date;
}