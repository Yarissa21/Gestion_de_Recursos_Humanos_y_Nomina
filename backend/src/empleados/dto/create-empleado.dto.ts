import {
  IsString, IsInt, IsDateString, IsNumber,
  IsNotEmpty, IsEnum, IsEmail, Matches, Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoEmpleado } from '@prisma/client';

export class CreateEmpleadoDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del empleado' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre_empleado!: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del empleado' })
  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  apellido_empleado!: string;

  @ApiProperty({ example: '1234567890123', description: 'DPI del empleado (13 dígitos sin guiones)' })
  @IsString()
  @Matches(/^\d{13}$/, { message: 'El DPI debe tener exactamente 13 dígitos' })
  dpi!: string;

  @ApiProperty({ example: '1995-06-15T12:00:00.000Z', description: 'Fecha de nacimiento (debe tener al menos 18 años)' })
  @IsDateString()
  fecha_nacimiento!: Date;

  @ApiProperty({ example: 'Guatemala, Guatemala', description: 'Dirección del empleado' })
  @IsString()
  direccion!: string;

  @ApiProperty({ example: '55551234', description: 'Teléfono del empleado (8 dígitos sin guiones)' })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos válidos' })
  telefono!: string;

  @ApiProperty({ example: 'juan.perez@empresa.com', description: 'Correo electrónico único del empleado' })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  correo!: string;

  @ApiProperty({ example: 5000, description: 'Salario base del empleado (entero positivo)' })
  @IsNumber()
  @Min(0, { message: 'El salario debe ser mayor o igual a 0' })
  salario!: number;

  @ApiProperty({ example: 'Activo', description: 'Estado del empleado', enum: EstadoEmpleado })
  @IsEnum(EstadoEmpleado, { message: 'El estado debe ser Activo, Suspendido o Retirado' })
  estado!: EstadoEmpleado;

  @ApiProperty({ example: 1, description: 'ID del departamento al que pertenece' })
  @IsInt()
  id_departamento!: number;

  @ApiProperty({ example: 2, description: 'ID del puesto (debe pertenecer al departamento indicado)' })
  @IsInt()
  id_puesto!: number;
}