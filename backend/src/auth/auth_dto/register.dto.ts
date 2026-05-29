import { IsString, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'juan_perez', description: 'Nombre de usuario (sin espacios)' })
  @IsString()
  nombre!: string;

  @ApiProperty({ example: 'password123', description: 'Contraseña (mínimo 6 caracteres)' })
  @IsString()
  password!: string;

  @ApiProperty({ example: 'user', description: 'Rol del usuario', enum: ['admin', 'user', 'UserRH'], required: false })
  @IsOptional()
  @IsIn(['admin', 'user', 'UserRH'])
  rol?: string;
}