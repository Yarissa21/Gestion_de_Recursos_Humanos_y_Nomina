import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDepartamentoDto {
  @ApiProperty({ example: 'Contabilidad', description: 'Nuevo nombre del departamento', required: false })
  @IsString()
  @IsOptional()
  nombre_departamento?: string;
}