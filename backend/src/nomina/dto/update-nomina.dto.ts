import { IsString, IsOptional, IsEnum } from 'class-validator';
import { EstadoNomina } from '@prisma/client';

export class UpdateNominaDto {
  @IsString()
  @IsOptional()
  periodo?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsEnum(EstadoNomina, { message: 'El estado debe ser Pendiente, Procesada o Cerrada' })
  @IsOptional()
  estado?: EstadoNomina;
}
