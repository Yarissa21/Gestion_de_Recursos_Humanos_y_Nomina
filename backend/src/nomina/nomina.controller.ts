import { Controller, Post, Body, Get, Put, Param, ParseIntPipe } from '@nestjs/common';
import { NominaService } from './nomina.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';

@Controller('nomina')
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post()
  async crear(@Body() dto: CreateNominaDto) {
    return this.nominaService.crearNomina(dto);
  }

  @Get()
  async listar() {
    return this.nominaService.listarNominas();
  }

  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.obtenerNomina(id);
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNominaDto
  ) {
    return this.nominaService.actualizarNomina(id, dto);
  }
}
