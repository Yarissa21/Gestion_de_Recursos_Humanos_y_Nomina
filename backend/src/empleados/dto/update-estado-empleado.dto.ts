import { IsEnum } from 'class-validator';
import { EstadoEmpleado } from '@prisma/client';

export class UpdateEstadoEmpleadoDto {
  @IsEnum(EstadoEmpleado, {
    message: 'El estado debe ser Activo, Suspendido o Retirado',
  })
  estado!: EstadoEmpleado;
}
