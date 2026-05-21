import { IsString, IsNotEmpty } from 'class-validator';

export class CreateDepartamentoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio' })
  nombre_departamento!: string;
}
