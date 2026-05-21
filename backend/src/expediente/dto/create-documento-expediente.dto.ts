import { IsString, IsNotEmpty, IsInt, IsDateString } from 'class-validator';

export class CreateDocumentoExpedienteDto {
  @IsString()
  @IsNotEmpty()
  nombre_documento!: string;

  @IsString()
  @IsNotEmpty()
  archivo!: string;

  @IsDateString()
  fecha_carga!: Date;

  @IsInt()
  id_tipo!: number;

  @IsInt()
  id_empleado!: number;

  @IsInt()
  id_usuario!: number;
}