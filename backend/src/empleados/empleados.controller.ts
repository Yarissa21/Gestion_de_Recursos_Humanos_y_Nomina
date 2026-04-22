import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { UpdateEstadoEmpleadoDto } from './dto/update-estado-empleado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('empleados')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @Post()
  @Roles('admin')
  async crear(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.crearEmpleado(dto);
  }

  @Get()
  @Roles('admin', 'UserRH')
  async listar() {
    return this.empleadosService.listarEmpleados();
  }

  @Put(':id')
  @Roles('admin')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.actualizarEmpleado(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.eliminarEmpleado(id);
  }

  @Patch(':id/estado')
  @Roles('admin')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoEmpleadoDto,
  ) {
    return this.empleadosService.actualizarEstadoEmpleado(id, dto.estado);
  }
}
