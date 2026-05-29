import { IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoNomina } from '@prisma/client';

export class UpdateNominaDto {
  @ApiProperty({
    example: 'Junio 2026',
    description: 'Nuevo período de la nómina',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(
    /^([A-Z][a-z]+ \d{4}|Primera Quincena [A-Z][a-z]+ \d{4}|Segunda Quincena [A-Z][a-z]+ \d{4})$/,
    { message: 'El período debe ser "Mes Año" o "Primera/Segunda Quincena Mes Año"' }
  )
  periodo?: string;

  @ApiProperty({ example: 'Quincenal', description: 'Tipo de nómina', enum: ['Mensual', 'Quincenal'], required: false })
  @IsString()
  @IsOptional()
  @Matches(/^(Mensual|Quincenal)$/, { message: 'El tipo debe ser Mensual o Quincenal' })
  tipo?: string;

  @ApiProperty({ example: 'Procesada', description: 'Estado de la nómina', enum: EstadoNomina, required: false })
  @IsEnum(EstadoNomina, { message: 'El estado debe ser Pendiente, Procesada o Cerrada' })
  @IsOptional()
  estado?: EstadoNomina;
}