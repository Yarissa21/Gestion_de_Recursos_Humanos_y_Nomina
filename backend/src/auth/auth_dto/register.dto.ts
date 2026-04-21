import { IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre!: string;

  @IsString()
  password!: string;

  @IsString()
  rol!: string;
}
