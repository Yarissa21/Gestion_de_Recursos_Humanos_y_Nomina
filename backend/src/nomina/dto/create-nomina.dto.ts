import { IsString, IsNotEmpty } from 'class-validator';

export class CreateNominaDto {
  @IsString()
  @IsNotEmpty({ message: 'El período es obligatorio' })
  periodo!: string; 

  @IsString()
  @IsNotEmpty({ message: 'El tipo es obligatorio' })
  tipo!: string; 
}
