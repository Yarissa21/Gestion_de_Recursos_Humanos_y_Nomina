import { IsString } from 'class-validator';

export class CreateConceptoDto {
  @IsString()
  nombre!: string;

  @IsString()
  tipo!: string; // Ej: BONIFICACION, DEDUCCION, COMISION, DESCUENTO
}