import { Controller, Get, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Usuarios')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @ApiOperation({ summary: 'Contar total de usuarios del sistema' })
  @ApiResponse({ status: 200, description: 'Total de usuarios' })
  @Roles('admin', 'UserRH')
  @Get()
  async contar() {
    return { total: await this.usuariosService.contarUsuarios() };
  }

  @ApiOperation({ summary: 'Listar usuarios del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios con su rol y empleado vinculado' })
  @Roles('admin', 'UserRH')
  @Get('lista')
  async listar() {
    return this.usuariosService.listarUsuarios();
  }

  @ApiOperation({ summary: 'Vincular empleado a usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_empleado: { type: 'number', example: 1, description: 'ID del empleado a vincular' },
      },
      required: ['id_empleado'],
    },
  })
  @ApiResponse({ status: 200, description: 'Empleado vinculado correctamente' })
  @ApiResponse({ status: 400, description: 'Usuario ya tiene empleado vinculado' })
  @ApiResponse({ status: 404, description: 'Usuario o empleado no encontrado' })
  @ApiResponse({ status: 409, description: 'Empleado ya vinculado a otro usuario' })
  @Roles('admin')
  @Patch(':id/empleado')
  async vincular(
    @Param('id', ParseIntPipe) id_usuario: number,
    @Body('id_empleado', ParseIntPipe) id_empleado: number,
  ) {
    return this.usuariosService.vincularEmpleado(id_usuario, id_empleado);
  }

  @ApiOperation({ summary: 'Desvincular empleado de usuario' })
  @ApiResponse({ status: 200, description: 'Empleado desvinculado correctamente' })
  @ApiResponse({ status: 400, description: 'El usuario no tiene empleado vinculado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @Roles('admin')
  @Delete(':id/empleado')
  async desvincular(@Param('id', ParseIntPipe) id_usuario: number) {
    return this.usuariosService.desvincularEmpleado(id_usuario);
  }

  @ApiOperation({ summary: 'Obtener empleado vinculado a un usuario' })
  @ApiResponse({ status: 200, description: 'Datos del empleado vinculado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado o sin empleado vinculado' })
  @Roles('admin')
  @Get(':id/empleado')
  async obtenerEmpleado(@Param('id', ParseIntPipe) id_usuario: number) {
    return this.usuariosService.obtenerEmpleadoDeUsuario(id_usuario);
  }
}