import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateConceptoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  tipo?: string;  // Ej: Bonificacion, Deduccion, Comision, Descuento
}
