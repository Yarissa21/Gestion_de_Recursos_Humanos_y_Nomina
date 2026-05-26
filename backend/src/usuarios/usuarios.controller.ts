import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  @Roles('admin', 'UserRH')
  async contar() {
    return { total: await this.usuariosService.contarUsuarios() };
  }

  @Get('lista')
  @Roles('admin', 'UserRH')
  async listar() {
    return this.usuariosService.listarUsuarios();
  }

  @Patch(':id/empleado')
  @Roles('admin')
  async vincular(
    @Param('id', ParseIntPipe) id_usuario: number,
    @Body('id_empleado', ParseIntPipe) id_empleado: number,
  ) {
    return this.usuariosService.vincularEmpleado(id_usuario, id_empleado);
  }

  @Delete(':id/empleado')
  @Roles('admin')
  async desvincular(@Param('id', ParseIntPipe) id_usuario: number) {
    return this.usuariosService.desvincularEmpleado(id_usuario);
  }

  @Get(':id/empleado')
  @Roles('admin')
  async obtenerEmpleado(@Param('id', ParseIntPipe) id_usuario: number) {
    return this.usuariosService.obtenerEmpleadoDeUsuario(id_usuario);
  }
}