import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class CreateNominaDto {
  @IsString()
  @IsNotEmpty({ message: 'El período es obligatorio' })
  @Matches(
    /^([A-Z][a-z]+ \d{4}|Primera Quincena [A-Z][a-z]+ \d{4}|Segunda Quincena [A-Z][a-z]+ \d{4})$/,
    { message: 'El período debe ser "Mes Año" o "Primera/Segunda Quincena Mes Año"' }
  )
  periodo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  @Matches(/^(Mensual|Quincenal)$/, { message: 'El tipo debe ser Mensual o Quincenal' })
  tipo!: string;
}
