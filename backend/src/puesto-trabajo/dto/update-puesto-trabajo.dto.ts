import { PartialType } from '@nestjs/mapped-types';
import { CreatePuestoTrabajoDto } from './create-puesto-trabajo.dto';

export class UpdatePuestoTrabajoDto extends PartialType(CreatePuestoTrabajoDto) {}