import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoEmpleado } from '@prisma/client';

export class UpdateEstadoEmpleadoDto {
  @ApiProperty({ example: 'Suspendido', description: 'Nuevo estado del empleado', enum: EstadoEmpleado })
  @IsEnum(EstadoEmpleado, { message: 'El estado debe ser Activo, Suspendido o Retirado' })
  estado!: EstadoEmpleado;
}