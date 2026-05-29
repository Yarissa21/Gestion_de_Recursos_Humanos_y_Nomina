import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartamentoDto {
  @ApiProperty({ example: 'Recursos Humanos', description: 'Nombre del departamento' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del departamento es obligatorio' })
  nombre_departamento!: string;
}