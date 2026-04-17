import { IsString, IsInt, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

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

  @IsString()
  estado!: string;

  @IsInt()
  id_departamento!: number;
}