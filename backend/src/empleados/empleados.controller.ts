import { Controller, Post, Body } from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';

@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  async crear(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.crearEmpleado(dto);
  }
}
