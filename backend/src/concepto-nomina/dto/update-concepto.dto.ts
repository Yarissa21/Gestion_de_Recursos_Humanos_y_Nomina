import { IsString, IsOptional } from 'class-validator';

export class UpdateConceptoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  tipo?: string;
}
