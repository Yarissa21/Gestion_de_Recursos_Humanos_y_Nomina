import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';

export class CreateAcademicoDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo!: string;

  @IsString()
  @IsNotEmpty({ message: 'La certificación es obligatoria' })
  certificacion!: string;

  @IsString()
  @IsNotEmpty({ message: 'La institución es obligatoria' })
  institucion!: string;

  @IsDateString({}, { message: 'La fecha de graduación debe ser válida' })
  fecha_graduacion!: Date;

  @IsInt({ message: 'El id del empleado debe ser un número' })
  id_empleado!: number;
}