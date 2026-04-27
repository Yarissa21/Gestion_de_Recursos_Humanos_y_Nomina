import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateDetalleConceptoDto {
  @IsInt()
  id_concepto!: number;   

  @IsNumber()
  @Min(0)
  monto!: number;
}