import { IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { EstadoNomina } from '@prisma/client';

export class UpdateNominaDto {
  @IsString()
  @IsOptional()
  @Matches(
    /^([A-Z][a-z]+ \d{4}|Primera Quincena [A-Z][a-z]+ \d{4}|Segunda Quincena [A-Z][a-z]+ \d{4})$/,
    { message: 'El período debe ser "Mes Año" o "Primera/Segunda Quincena Mes Año"' }
  )
  periodo?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(Mensual|Quincenal)$/, { message: 'El tipo debe ser Mensual o Quincenal' })
  tipo?: string;

  @IsEnum(EstadoNomina, { message: 'El estado debe ser Pendiente, Procesada o Cerrada' })
  @IsOptional()
  estado?: EstadoNomina;
}
