import { Controller, Post, Body, Get, Put, Param, ParseIntPipe } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';

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

}
