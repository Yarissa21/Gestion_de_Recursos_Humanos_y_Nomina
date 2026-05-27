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
  Req,
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

  @Get('mi-perfil')
  @UseGuards(JwtAuthGuard)
  async miPerfil(@Req() req: any) {
    return this.empleadosService.obtenerPerfilPropio(req.user.id_usuario);
  }

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
  @Get('mi-perfil/completo')
  @UseGuards(JwtAuthGuard)
  async miPerfilCompleto(@Req() req: any) {
    return this.empleadosService.miPerfilCompleto(req.user.id_usuario);
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
