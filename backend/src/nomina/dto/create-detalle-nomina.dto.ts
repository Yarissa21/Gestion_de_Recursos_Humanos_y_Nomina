import { IsInt, IsNumber, Min } from 'class-validator';

export class CreateDetalleNominaDto {
  @IsInt()
  id_empleado!: number;

  @IsNumber()
  @Min(0)
  horas_trabajadas!: number;

  @IsNumber()
  @Min(0)
  horas_extra!: number;
}
