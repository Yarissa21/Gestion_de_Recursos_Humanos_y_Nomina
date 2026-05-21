import { IsEnum } from 'class-validator';

export enum EstadoNomina {
  Pendiente = 'Pendiente',
  Procesada = 'Procesada',
  Cerrada = 'Cerrada',
}

export class UpdateEstadoNominaDto {
  @IsEnum(EstadoNomina, { message: 'El estado debe ser Pendiente, Procesada o Cerrada' })
  estado!: EstadoNomina;
}
