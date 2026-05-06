import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateTipoDocumentoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @IsBoolean()
  obligatorio!: boolean;
}