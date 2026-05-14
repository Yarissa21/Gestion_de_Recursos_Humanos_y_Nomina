import {
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsEmail,
  Matches,
  Min,
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
  @Matches(/^\d{13}$/, { message: 'El DPI debe tener exactamente 13 dígitos' })
  @IsOptional()
  dpi?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: Date;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos válidos' })
  @IsOptional()
  telefono?: string;

  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsOptional()
  correo?: string;

  @IsNumber()
  @Min(0, { message: 'El salario debe ser mayor o igual a 0' })
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

  @IsInt()
  @IsOptional()
  id_puesto?: number;
}
