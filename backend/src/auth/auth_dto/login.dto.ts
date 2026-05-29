import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin', description: 'Nombre de usuario' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña del usuario' })
  @IsString()
  password!: string;
}