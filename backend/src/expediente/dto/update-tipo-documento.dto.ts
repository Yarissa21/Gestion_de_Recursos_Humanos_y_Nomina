import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateTipoDocumentoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsBoolean()
  @IsOptional()
  obligatorio?: boolean;
}