import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateDetalleConceptoDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  monto?: number;
}