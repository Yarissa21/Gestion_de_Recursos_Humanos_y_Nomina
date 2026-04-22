import { IsString, IsOptional } from 'class-validator';

export class UpdateNominaDto {
  @IsString()
  @IsOptional()
  periodo?: string;

  @IsString()
  @IsOptional()
  tipo?: string;

  @IsString()
  @IsOptional()
  estado?: string; 
}
