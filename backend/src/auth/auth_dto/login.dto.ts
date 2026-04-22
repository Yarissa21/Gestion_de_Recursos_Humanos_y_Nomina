import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  nombre!: string;

  @IsString()
  password!: string;
}
