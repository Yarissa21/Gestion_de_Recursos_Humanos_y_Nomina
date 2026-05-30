import { IsString, IsInt, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePuestoTrabajoDto {
  @ApiProperty({ example: 'Gerente de Recursos Humanos', description: 'Nombre del puesto de trabajo' })
  @IsString()
  @IsNotEmpty()
  nombre_puesto!: string;

  @ApiProperty({ example: 1, description: 'ID del departamento al que pertenece el puesto' })
  @IsInt()
  id_departamento!: number;
}