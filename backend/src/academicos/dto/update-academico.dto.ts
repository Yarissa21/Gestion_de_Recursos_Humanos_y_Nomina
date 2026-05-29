import { IsString, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAcademicoDto {
  @ApiProperty({ example: 'Maestría en Administración', description: 'Nuevo título académico', required: false })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiProperty({ example: 'Título de Maestría', description: 'Nueva certificación', required: false })
  @IsString()
  @IsOptional()
  certificacion?: string;

  @ApiProperty({ example: 'Universidad Rafael Landívar', description: 'Nueva institución', required: false })
  @IsString()
  @IsOptional()
  institucion?: string;

  @ApiProperty({ example: '2023-06-01T12:00:00.000Z', description: 'Nueva fecha de graduación (no puede ser futura)', required: false })
  @IsDateString({}, { message: 'La fecha de graduación debe ser válida' })
  @IsOptional()
  fecha_graduacion?: Date;

  @ApiProperty({ example: 1, description: 'ID del empleado (requerido para validar permisos)', required: false })
  @IsInt({ message: 'El id del empleado debe ser un número' })
  @IsOptional()
  id_empleado?: number;
}