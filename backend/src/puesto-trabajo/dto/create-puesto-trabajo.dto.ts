import { IsString, IsInt } from 'class-validator';

export class CreatePuestoTrabajoDto {
  @IsString()
  nombre_puesto!: string;

  @IsInt()
  id_departamento!: number;
}