import {
  IsString, IsInt, IsDateString, IsNumber,
  IsOptional, IsEnum, IsEmail, Matches, Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoEmpleado } from '@prisma/client';

export class UpdateEmpleadoDto {
  @ApiProperty({ example: 'Juan', description: 'Nombre del empleado', required: false })
  @IsString()
  @IsOptional()
  nombre_empleado?: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellido del empleado', required: false })
  @IsString()
  @IsOptional()
  apellido_empleado?: string;

  @ApiProperty({ example: '1234567890123', description: 'DPI (13 dígitos sin guiones)', required: false })
  @IsString()
  @Matches(/^\d{13}$/, { message: 'El DPI debe tener exactamente 13 dígitos' })
  @IsOptional()
  dpi?: string;

  @ApiProperty({ example: '1995-06-15T12:00:00.000Z', description: 'Fecha de nacimiento', required: false })
  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: Date;

  @ApiProperty({ example: 'Mixco, Guatemala', description: 'Dirección del empleado', required: false })
  @IsString()
  @IsOptional()
  direccion?: string;

  @ApiProperty({ example: '55551234', description: 'Teléfono (8 dígitos sin guiones)', required: false })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'El teléfono debe tener 8 dígitos válidos' })
  @IsOptional()
  telefono?: string;

  @ApiProperty({ example: 'juan.perez@empresa.com', description: 'Correo electrónico único', required: false })
  @IsEmail({}, { message: 'Debe ser un correo válido' })
  @IsOptional()
  correo?: string;

  @ApiProperty({ example: 6000, description: 'Salario base (entero positivo)', required: false })
  @IsNumber()
  @Min(0, { message: 'El salario debe ser mayor o igual a 0' })
  @IsOptional()
  salario?: number;

  @ApiProperty({ example: 'Activo', description: 'Estado del empleado', enum: EstadoEmpleado, required: false })
  @IsEnum(EstadoEmpleado, { message: 'El estado debe ser Activo, Suspendido o Retirado' })
  @IsOptional()
  estado?: EstadoEmpleado;

  @ApiProperty({ example: 1, description: 'ID del departamento', required: false })
  @IsInt()
  @IsOptional()
  id_departamento?: number;

  @ApiProperty({ example: 2, description: 'ID del puesto', required: false })
  @IsInt()
  @IsOptional()
  id_puesto?: number;
}