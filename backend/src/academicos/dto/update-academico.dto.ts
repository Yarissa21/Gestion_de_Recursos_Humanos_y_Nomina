import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';

export class UpdateAcademicoDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  certificacion?: string;

  @IsString()
  @IsOptional()
  institucion?: string;

  @IsDateString({}, { message: 'La fecha de graduación debe ser válida' })
  @IsOptional()
  fecha_graduacion?: Date;

  @IsInt({ message: 'El id del empleado debe ser un número' })
  @IsOptional()
  id_empleado?: number;
}