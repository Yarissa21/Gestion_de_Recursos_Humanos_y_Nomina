import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoDocumentoDto {
  @ApiProperty({ example: 'DPI', description: 'Nombre del tipo de documento' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre!: string;

  @ApiProperty({ example: true, description: 'Indica si el documento es obligatorio para el expediente' })
  @IsBoolean()
  obligatorio!: boolean;
}