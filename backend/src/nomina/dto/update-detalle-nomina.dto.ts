import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateDetalleNominaDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  horas_trabajadas?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  horas_extra?: number;
}
