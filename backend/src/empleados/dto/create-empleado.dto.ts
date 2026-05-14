import {
  IsString,
  IsInt,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  Matches,
  Min,
} from 'class-validator';
import { EstadoEmpleado } from '@prisma/client';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre_empleado!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido_empleado!: string;

  @IsString()
  @Matches(/^\d{13}$/, { message: 'El DPI debe tener exactamente 13 dígitos' })
  dpi!: string;

  @IsDateString()
  fecha_nacimiento!: Date;

  @IsString()
  direccion!: string;

  @IsString()
  @Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos válidos' })
  telefono!: string;

  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correo!: string;

  @IsNumber()
  @Min(0, { message: 'El salario debe ser mayor o igual a 0' })
  salario!: number;

  @IsEnum(EstadoEmpleado, {
    message: 'El estado debe ser Activo, Suspendido o Retirado',
  })
  estado!: EstadoEmpleado;

  @IsInt()
  id_departamento!: number;

  @IsInt()
  id_puesto!: number;
}
