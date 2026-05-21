import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { PuestoTrabajoService } from './puesto-trabajo.service';
import { CreatePuestoTrabajoDto } from './dto/create-puesto-trabajo.dto';
import { UpdatePuestoTrabajoDto } from './dto/update-puesto-trabajo.dto';

@Controller('puestos')
export class PuestoTrabajoController {
  constructor(private readonly service: PuestoTrabajoService) {}

  @Post()
  crearPuesto(@Body() dto: CreatePuestoTrabajoDto) {
    return this.service.crearPuesto(dto);
  }

  @Get()
  listarPuestos() {
    return this.service.listarPuestos();
  }

  @Get(':id')
  obtenerPuesto(@Param('id') id: string) {
    return this.service.obtenerPuesto(+id);
  }

  @Put(':id')
  actualizarPuesto(@Param('id') id: string, @Body() dto: UpdatePuestoTrabajoDto) {
    return this.service.actualizarPuesto(+id, dto);
  }

  @Delete(':id')
  eliminarPuesto(@Param('id') id: string) {
    return this.service.eliminarPuesto(+id);
  }
}
