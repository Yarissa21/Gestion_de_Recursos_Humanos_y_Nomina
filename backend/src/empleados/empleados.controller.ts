import {
  Controller, Post, Body, Get, Put,
  Param, ParseIntPipe, Delete, Patch, UseGuards, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmpleadosService } from './empleados.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { UpdateEstadoEmpleadoDto } from './dto/update-estado-empleado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Empleados')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('empleados')
export class EmpleadosController {
  constructor(private readonly empleadosService: EmpleadosService) {}

  @ApiOperation({ summary: 'Obtener perfil propio del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil del empleado vinculado al usuario' })
  @ApiResponse({ status: 404, description: 'No tienes un perfil de empleado vinculado' })
  @UseGuards(JwtAuthGuard)
  @Get('mi-perfil')
  async miPerfil(@Req() req: any) {
    return this.empleadosService.obtenerPerfilPropio(req.user.id_usuario);
  }

  @ApiOperation({ summary: 'Obtener perfil completo con documentos, académicos y tipos' })
  @ApiResponse({ status: 200, description: 'Perfil completo del empleado' })
  @UseGuards(JwtAuthGuard)
  @Get('mi-perfil/completo')
  async miPerfilCompleto(@Req() req: any) {
    return this.empleadosService.miPerfilCompleto(req.user.id_usuario);
  }

  @ApiOperation({ summary: 'Crear empleado' })
  @ApiResponse({ status: 201, description: 'Empleado creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o edad menor a 18 años' })
  @ApiResponse({ status: 404, description: 'Puesto o departamento no existe' })
  @ApiResponse({ status: 409, description: 'DPI o correo ya registrado' })
  @Roles('admin')
  @Post()
  async crear(@Body() dto: CreateEmpleadoDto) {
    return this.empleadosService.crearEmpleado(dto);
  }

  @ApiOperation({ summary: 'Listar todos los empleados activos' })
  @ApiResponse({ status: 200, description: 'Lista de empleados' })
  @Roles('admin', 'UserRH')
  @Get()
  async listar() {
    return this.empleadosService.listarEmpleados();
  }

  @ApiOperation({ summary: 'Actualizar datos del empleado' })
  @ApiResponse({ status: 200, description: 'Empleado actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @ApiResponse({ status: 409, description: 'DPI o correo ya registrado' })
  @Roles('admin')
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmpleadoDto,
  ) {
    return this.empleadosService.actualizarEmpleado(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar empleado (soft delete en cascada)' })
  @ApiResponse({ status: 200, description: 'Empleado eliminado correctamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin')
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.empleadosService.eliminarEmpleado(id);
  }

  @ApiOperation({ summary: 'Cambiar estado del empleado' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin')
  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstadoEmpleadoDto,
  ) {
    return this.empleadosService.actualizarEstadoEmpleado(id, dto.estado);
  }
}