import { IsString, IsOptional } from 'class-validator';

export class UpdateDepartamentoDto {
  @IsString()
  @IsOptional()
  nombre_departamento?: string;
}
