import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateTipoDocumentoAcademicoDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  obligatorio?: boolean;
}