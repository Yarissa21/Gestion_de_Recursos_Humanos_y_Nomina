import { Controller, Post, Body } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';

@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  async crear(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.crearDepartamento(dto);
  }
}
