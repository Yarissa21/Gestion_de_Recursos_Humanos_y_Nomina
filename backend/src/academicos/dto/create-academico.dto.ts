import { IsString, IsNotEmpty, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAcademicoDto {
  @ApiProperty({ example: 'Licenciatura en Administración de Empresas', description: 'Título académico obtenido' })
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  titulo!: string;

  @ApiProperty({ example: 'Título Universitario', description: 'Tipo de certificación' })
  @IsString()
  @IsNotEmpty({ message: 'La certificación es obligatoria' })
  certificacion!: string;

  @ApiProperty({ example: 'Universidad de San Carlos de Guatemala', description: 'Institución que otorgó el título' })
  @IsString()
  @IsNotEmpty({ message: 'La institución es obligatoria' })
  institucion!: string;

  @ApiProperty({ example: '2020-11-15T12:00:00.000Z', description: 'Fecha de graduación (no puede ser futura)' })
  @IsDateString({}, { message: 'La fecha de graduación debe ser válida' })
  fecha_graduacion!: Date;

  @ApiProperty({ example: 1, description: 'ID del empleado al que pertenece el registro académico' })
  @IsInt({ message: 'El id del empleado debe ser un número' })
  id_empleado!: number;
}