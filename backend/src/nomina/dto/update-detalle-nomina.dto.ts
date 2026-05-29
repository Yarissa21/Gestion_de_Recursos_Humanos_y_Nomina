import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDetalleNominaDto {
  @ApiProperty({ example: 191, description: 'Horas trabajadas en el período (entero)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  horas_trabajadas?: number;

  @ApiProperty({ example: 10, description: 'Horas extra trabajadas (entero)', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  horas_extra?: number;
}