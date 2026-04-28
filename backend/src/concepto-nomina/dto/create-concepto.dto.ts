import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateConceptoDto {
  @IsString()
  nombre!: string;

  @IsString()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  tipo!: string; // Ej: Bonificacion, Deduccion, Comision, Descuento
}