import { Controller, Post, Body, Get, Put, Param, ParseIntPipe } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  async crear(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.crearDepartamento(dto);
  }

  @Get()
  async listar() {
    return this.departamentosService.listarDepartamentos();
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto
  ) {
    return this.departamentosService.actualizarDepartamento(id, dto);
  }
}
