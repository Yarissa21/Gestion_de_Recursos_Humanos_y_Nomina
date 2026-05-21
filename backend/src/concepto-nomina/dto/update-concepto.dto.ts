import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateConceptoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  tipo?: string;  

  @IsNumber()
  @Min(0)
  @IsOptional()
  porcentaje?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monto_fijo?: number;

  @IsOptional()
  fecha_aplica?: Date;
}
