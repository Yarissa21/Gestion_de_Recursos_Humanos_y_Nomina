import { IsString, IsOptional, IsIn } from 'class-validator';

export class RegisterDto {
  @IsString()
  nombre!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsIn(['admin', 'user', 'UserRH'])
  rol?: string;
}
