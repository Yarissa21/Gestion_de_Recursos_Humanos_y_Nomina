import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EstadoNomina {
  Pendiente = 'Pendiente',
  Procesada = 'Procesada',
  Cerrada   = 'Cerrada',
}

export class UpdateEstadoNominaDto {
  @ApiProperty({ example: 'Procesada', description: 'Nuevo estado de la nómina', enum: EstadoNomina })
  @IsEnum(EstadoNomina, { message: 'El estado debe ser Pendiente, Procesada o Cerrada' })
  estado!: EstadoNomina;
}