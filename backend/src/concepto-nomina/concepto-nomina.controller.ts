import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ConceptoNominaService } from './concepto-nomina.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Controller('conceptos')
export class ConceptoNominaController {
  constructor(private readonly conceptoService: ConceptoNominaService) {}

  @Post()
  async crear(@Body() dto: CreateConceptoDto) {
    return this.conceptoService.crearConcepto(dto);
  }

  @Get()
  async listar() {
    return this.conceptoService.listarConceptos();
  }

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id_concepto: number) {
    return this.conceptoService.obtenerConcepto(id_concepto);
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id_concepto: number,
    @Body() dto: UpdateConceptoDto
  ) {
    return this.conceptoService.actualizarConcepto(id_concepto, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id_concepto: number) {
    return this.conceptoService.eliminarConcepto(id_concepto);
  }
}