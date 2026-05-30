import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PuestoTrabajoService } from './puesto-trabajo.service';
import { CreatePuestoTrabajoDto } from './dto/create-puesto-trabajo.dto';
import { UpdatePuestoTrabajoDto } from './dto/update-puesto-trabajo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Puestos de Trabajo')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('puestos')
export class PuestoTrabajoController {
  constructor(private readonly service: PuestoTrabajoService) {}

  @ApiOperation({ summary: 'Crear puesto de trabajo' })
  @ApiResponse({ status: 201, description: 'Puesto creado correctamente' })
  @ApiResponse({ status: 400, description: 'Nombre vacío o departamento no existe' })
  @ApiResponse({ status: 409, description: 'Ya existe ese puesto en el departamento' })
  @Roles('admin')
  @Post()
  crearPuesto(@Body() dto: CreatePuestoTrabajoDto) {
    return this.service.crearPuesto(dto);
  }

  @ApiOperation({ summary: 'Listar puestos de trabajo activos' })
  @ApiResponse({ status: 200, description: 'Lista de puestos con su departamento' })
  @Roles('admin', 'UserRH')
  @Get()
  listarPuestos() {
    return this.service.listarPuestos();
  }

  @ApiOperation({ summary: 'Obtener puesto por ID' })
  @ApiResponse({ status: 200, description: 'Puesto encontrado' })
  @ApiResponse({ status: 404, description: 'Puesto no encontrado' })
  @Roles('admin', 'UserRH')
  @Get(':id')
  obtenerPuesto(@Param('id') id: string) {
    return this.service.obtenerPuesto(+id);
  }

  @ApiOperation({ summary: 'Actualizar puesto de trabajo' })
  @ApiResponse({ status: 200, description: 'Puesto actualizado' })
  @ApiResponse({ status: 400, description: 'Nombre vacío o departamento no existe' })
  @ApiResponse({ status: 404, description: 'Puesto no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe ese puesto en el departamento' })
  @Roles('admin')
  @Put(':id')
  actualizarPuesto(@Param('id') id: string, @Body() dto: UpdatePuestoTrabajoDto) {
    return this.service.actualizarPuesto(+id, dto);
  }

  @ApiOperation({ summary: 'Eliminar puesto de trabajo (soft delete)' })
  @ApiResponse({ status: 200, description: 'Puesto eliminado' })
  @ApiResponse({ status: 400, description: 'Tiene empleados asignados' })
  @ApiResponse({ status: 404, description: 'Puesto no encontrado' })
  @Roles('admin')
  @Delete(':id')
  eliminarPuesto(@Param('id') id: string) {
    return this.service.eliminarPuesto(+id);
  }
}