import { IsInt, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateDetalleConceptoDto {
  @IsInt()
  id_concepto!: number;   

  @IsNumber()
  @Min(0)
  @IsOptional()
  monto?: number;
}