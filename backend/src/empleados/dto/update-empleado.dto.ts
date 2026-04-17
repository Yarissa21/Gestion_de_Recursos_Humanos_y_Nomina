import { IsString, IsInt, IsDateString, IsNumber, IsOptional } from 'class-validator';

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

  @IsString()
  @IsOptional()
  estado?: string;

  @IsInt()
  @IsOptional()
  id_departamento?: number;
}
