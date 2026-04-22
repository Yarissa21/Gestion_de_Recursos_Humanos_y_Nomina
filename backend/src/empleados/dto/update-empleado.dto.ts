import {
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { EstadoEmpleado } from '@prisma/client';

export class UpdateEmpleadoDto {
  @IsString()
  @IsOptional()
  nombre_empleado?: string;

  @IsString()
  @IsOptional()
  apellido_empleado?: string;

  @IsString()
  @IsOptional()
  dpi?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: Date;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsNumber()
  @IsOptional()
  salario?: number;

  @IsEnum(EstadoEmpleado, {
    message: 'El estado debe ser Activo, Suspendido o Retirado',
  })
  @IsOptional()
  estado?: EstadoEmpleado;

  @IsInt()
  @IsOptional()
  id_departamento?: number;
}
