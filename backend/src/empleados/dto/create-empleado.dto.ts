import { IsString, IsInt, IsDateString, IsNumber, IsNotEmpty, IsEnum } from 'class-validator';
import { EstadoEmpleado } from '@prisma/client';

export class CreateEmpleadoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre_empleado!: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido_empleado!: string;

  @IsString()
  @IsNotEmpty({ message: 'El DPI es obligatorio' })
  dpi!: string;

  @IsDateString()
  fecha_nacimiento!: Date;

  @IsString()
  direccion!: string;

  @IsString()
  telefono!: string;

  @IsNumber()
  salario!: number;

  @IsEnum(EstadoEmpleado, { message: 'El estado debe ser Activo, Suspendido o Retirado' })
  estado!: EstadoEmpleado;

  @IsInt()
  id_departamento!: number;
}