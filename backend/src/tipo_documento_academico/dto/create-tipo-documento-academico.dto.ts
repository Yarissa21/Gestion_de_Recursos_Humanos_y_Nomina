import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';

export class CreateTipoDocumentoAcademicoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsBoolean()
  obligatorio!: boolean;
}