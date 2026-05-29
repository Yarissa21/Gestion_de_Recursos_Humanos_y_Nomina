import {
  Controller, Post, Body, Get, Put, Param, ParseIntPipe,
  UseGuards, Delete, Patch, Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NominaService } from './nomina.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { UpdateDetalleNominaDto } from './dto/update-detalle-nomina.dto';
import { UpdateDetalleConceptoDto } from './dto/update-detalle-concepto.dto';
import { UpdateEstadoNominaDto } from './dto/update-estado-nomina.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NominaEditableGuard } from '../nomina/nomina-editable.guard';

@ApiTags('Nómina')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nomina')
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @ApiOperation({ summary: 'Crear nómina (genera detalles para todos los empleados activos)' })
  @ApiResponse({ status: 201, description: 'Nómina creada correctamente' })
  @ApiResponse({ status: 400, description: 'Período futuro, duplicado o formato inválido' })
  @Roles('admin')
  @Post()
  async crear(@Body() dto: CreateNominaDto) {
    return this.nominaService.crearNomina(dto);
  }

  @ApiOperation({ summary: 'Listar todas las nóminas' })
  @ApiResponse({ status: 200, description: 'Lista de nóminas' })
  @Roles('admin', 'UserRH')
  @Get()
  async listar() {
    return this.nominaService.listarNominas();
  }

  @ApiOperation({ summary: 'Ver mis nóminas (empleado autenticado)' })
  @ApiResponse({ status: 200, description: 'Nóminas del empleado vinculado al usuario' })
  @Roles('admin', 'UserRH', 'user')
  @Get('mis-nominas')
  async listarMisNominas(@Req() req: any) {
    return this.nominaService.listarNominasPorEmpleado(req.user.id_usuario);
  }

  @ApiOperation({ summary: 'Obtener nómina por ID' })
  @ApiResponse({ status: 200, description: 'Nómina encontrada' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin', 'UserRH', 'user')
  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.obtenerNomina(id);
  }

  @ApiOperation({ summary: 'Actualizar nómina' })
  @ApiResponse({ status: 200, description: 'Nómina actualizada' })
  @ApiResponse({ status: 400, description: 'Período inválido o duplicado' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin')
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNominaDto,
  ) {
    return this.nominaService.actualizarNomina(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar nómina (soft delete en cascada)' })
  @ApiResponse({ status: 200, description: 'Nómina eliminada' })
  @ApiResponse({ status: 400, description: 'No se puede eliminar una nómina cerrada' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin')
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.eliminarNomina(id);
  }

  @ApiOperation({ summary: 'Cambiar estado de la nómina' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin', 'UserRH')
  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id_nomina: number,
    @Body() dto: UpdateEstadoNominaDto,
  ) {
    return this.nominaService.actualizarEstadoNomina(id_nomina, dto.estado);
  }

  // ============================
  // DETALLE NÓMINA
  // ============================

  @ApiOperation({ summary: 'Listar detalles de una nómina' })
  @ApiResponse({ status: 200, description: 'Lista de detalles con empleado y totales' })
  @Roles('admin', 'UserRH', 'user')
  @Get(':id/detalles')
  async listarDetalles(@Param('id', ParseIntPipe) id_nomina: number) {
    return this.nominaService.listarDetallesNomina(id_nomina);
  }

  @ApiOperation({ summary: 'Obtener detalle de nómina por ID' })
  @ApiResponse({ status: 200, description: 'Detalle encontrado' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @Roles('admin', 'UserRH')
  @Get('detalles/:id')
  async obtenerDetalle(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.obtenerDetalleNomina(id_detalle);
  }

  @ApiOperation({ summary: 'Actualizar horas de detalle de nómina' })
  @ApiResponse({ status: 200, description: 'Detalle actualizado' })
  @ApiResponse({ status: 400, description: 'Horas deben ser enteros o nómina cerrada' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @Roles('admin', 'UserRH')
  @UseGuards(NominaEditableGuard)
  @Put('detalles/:id')
  async actualizarDetalle(
    @Param('id', ParseIntPipe) id_detalle: number,
    @Body() dto: UpdateDetalleNominaDto,
    @Req() req: any,
  ) {
    return this.nominaService.actualizarDetalleNomina(id_detalle, dto, req.user.id_usuario);
  }

  @ApiOperation({ summary: 'Eliminar detalle de nómina (soft delete)' })
  @ApiResponse({ status: 200, description: 'Detalle eliminado' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @Roles('admin')
  @UseGuards(NominaEditableGuard)
  @Delete('detalles/:id')
  async eliminarDetalle(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.eliminarDetalleNomina(id_detalle);
  }

  // ============================
  // DETALLE CONCEPTO NÓMINA
  // ============================

  @ApiOperation({ summary: 'Listar conceptos de un detalle de nómina' })
  @ApiResponse({ status: 200, description: 'Lista de conceptos aplicados' })
  @Roles('admin', 'UserRH', 'user')
  @Get('detalles/:id/conceptos')
  async listarDetalleConceptos(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.listarDetalleConceptos(id_detalle);
  }

  @ApiOperation({ summary: 'Obtener concepto de detalle por ID' })
  @ApiResponse({ status: 200, description: 'Concepto encontrado' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Roles('admin', 'UserRH')
  @Get('conceptos/:id')
  async obtenerDetalleConcepto(@Param('id', ParseIntPipe) id_detalle_concepto: number) {
    return this.nominaService.obtenerDetalleConcepto(id_detalle_concepto);
  }

  @ApiOperation({ summary: 'Actualizar monto de concepto manual' })
  @ApiResponse({ status: 200, description: 'Concepto actualizado' })
  @ApiResponse({ status: 400, description: 'Monto negativo o nómina cerrada' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Roles('admin', 'UserRH')
  @UseGuards(NominaEditableGuard)
  @Put('conceptos/:id')
  async actualizarDetalleConcepto(
    @Param('id', ParseIntPipe) id_detalle_concepto: number,
    @Body() dto: UpdateDetalleConceptoDto,
    @Req() req: any,
  ) {
    return this.nominaService.actualizarDetalleConcepto(id_detalle_concepto, dto, req.user.id_usuario);
  }

  @ApiOperation({ summary: 'Eliminar concepto de detalle (soft delete)' })
  @ApiResponse({ status: 200, description: 'Concepto eliminado' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Roles('admin')
  @UseGuards(NominaEditableGuard)
  @Delete('conceptos/:id')
  async eliminarDetalleConcepto(@Param('id', ParseIntPipe) id_detalle_concepto: number) {
    return this.nominaService.eliminarDetalleConcepto(id_detalle_concepto);
  }

  // ============================
  // CALCULAR NÓMINA
  // ============================

  @ApiOperation({ summary: 'Recalcular totales de un detalle' })
  @ApiResponse({ status: 200, description: 'Detalle recalculado con nuevos totales' })
  @ApiResponse({ status: 404, description: 'Detalle no encontrado' })
  @Roles('admin', 'UserRH')
  @UseGuards(NominaEditableGuard)
  @Post('detalles/:id/recalcular')
  async recalcularDetalle(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.recalcularDetalle(id_detalle);
  }

  @ApiOperation({ summary: 'Sincronizar empleados faltantes en la nómina' })
  @ApiResponse({ status: 200, description: 'Nómina sincronizada' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin', 'UserRH')
  @UseGuards(NominaEditableGuard)
  @Post(':id/sincronizar')
  async sincronizar(@Param('id', ParseIntPipe) id_nomina: number) {
    return this.nominaService.sincronizarEmpleadosNomina(id_nomina);
  }

  // ============================
  // HISTORIAL AJUSTE NÓMINA
  // ============================

  @ApiOperation({ summary: 'Historial de ajustes de una nómina' })
  @ApiResponse({ status: 200, description: 'Lista de ajustes ordenados por fecha' })
  @Roles('admin', 'UserRH')
  @Get(':id/ajustes')
  async historialNomina(@Param('id', ParseIntPipe) id_nomina: number) {
    return this.nominaService.historialNomina(id_nomina);
  }
}