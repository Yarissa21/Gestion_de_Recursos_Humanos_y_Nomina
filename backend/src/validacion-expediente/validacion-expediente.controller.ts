import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ValidacionExpedienteService } from './validacion-expediente.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Validación Expediente')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('validacion-expediente')
export class ValidacionExpedienteController {
  constructor(private readonly service: ValidacionExpedienteService) {}

  @ApiOperation({ summary: 'Validar y recalcular expedientes de todos los empleados' })
  @ApiResponse({ status: 200, description: 'Lista de resultados con estado y faltantes por empleado' })
  @Roles('admin')
  @Get()
  validarTodos() {
    return this.service.validarTodos();
  }

  @ApiOperation({ summary: 'Resumen de validaciones sin recalcular (más rápido)' })
  @ApiResponse({ status: 200, description: 'Lista de empleados con estado y progreso' })
  @Roles('admin')
  @Get('resumen')
  resumenTodos() {
    return this.service.resumenTodos();
  }

  @ApiOperation({ summary: 'Obtener validaciones guardadas en base de datos' })
  @ApiResponse({ status: 200, description: 'Lista de validaciones guardadas con datos del empleado' })
  @Roles('admin')
  @Get('guardadas')
  obtenerGuardadas() {
    return this.service.obtenerValidacionesGuardadas();
  }

  @ApiOperation({ summary: 'Validar expediente de un empleado específico' })
  @ApiResponse({ status: 200, description: 'Estado de validación con documentos faltantes' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin')
  @Get(':id_empleado')
  validarUno(@Param('id_empleado', ParseIntPipe) id: number) {
    return this.service.validarEmpleado(id);
  }
}