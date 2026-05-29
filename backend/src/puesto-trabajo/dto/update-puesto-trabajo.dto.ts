import { IsString, IsInt, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePuestoTrabajoDto {
  @ApiProperty({ example: 'Coordinador de RRHH', description: 'Nuevo nombre del puesto', required: false })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nombre_puesto?: string;

  @ApiProperty({ example: 2, description: 'Nuevo departamento del puesto', required: false })
  @IsInt()
  @IsOptional()
  id_departamento?: number;
}