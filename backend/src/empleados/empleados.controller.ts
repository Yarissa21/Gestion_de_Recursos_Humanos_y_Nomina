import { Controller, Post, Body, Get, Put, Param, ParseIntPipe, Delete, Patch } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { UpdateEstadoEmpleadoDto } from './dto/update-estado-empleado.dto';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  async crear(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.crearEmpleado(dto);
  }

  @Get()
  async listar() {
    return this.empleadosService.listarEmpleados();
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto
  ) {
    return this.empleadosService.actualizarEmpleado(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.eliminarEmpleado(id);
  }

  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoEmpleadoDto
  ) {
    return this.empleadosService.actualizarEstadoEmpleado(id, dto.estado);
  }
}
