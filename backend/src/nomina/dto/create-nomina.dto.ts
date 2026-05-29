import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNominaDto {
  @ApiProperty({
    example: 'Mayo 2026',
    description: 'Período de la nómina. Formato: "Mes Año" para mensual o "Primera/Segunda Quincena Mes Año" para quincenal',
  })
  @IsString()
  @IsNotEmpty({ message: 'El período es obligatorio' })
  @Matches(
    /^([A-Z][a-z]+ \d{4}|Primera Quincena [A-Z][a-z]+ \d{4}|Segunda Quincena [A-Z][a-z]+ \d{4})$/,
    { message: 'El período debe ser "Mes Año" o "Primera/Segunda Quincena Mes Año"' }
  )
  periodo!: string;

  @ApiProperty({ example: 'Mensual', description: 'Tipo de nómina', enum: ['Mensual', 'Quincenal'] })
  @IsString()
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @Matches(/^(Mensual|Quincenal)$/, { message: 'El tipo debe ser Mensual o Quincenal' })
  tipo!: string;
}