import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Delete,
  Patch,
} from '@nestjs/common';
import { NominaService } from './nomina.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateDetalleNominaDto } from './dto/create-detalle-nomina.dto';
import { UpdateDetalleNominaDto } from './dto/update-detalle-nomina.dto';
import { CreateDetalleConceptoDto } from './dto/create-detalle-concepto.dto';
import { UpdateDetalleConceptoDto } from './dto/update-detalle-concepto.dto';
import { UpdateEstadoNominaDto } from './dto/update-estado-nomina.dto';
import { NominaEditableGuard } from '../nomina/nomina-editable.guard';

@Controller('nomina')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post()
  @Roles('admin')
  async crear(@Body() dto: CreateNominaDto) {
    return this.nominaService.crearNomina(dto);
  }

  @Get()
  @Roles('admin', 'UserRH')
  async listar() {
    return this.nominaService.listarNominas();
  }

  @Get(':id')
  @Roles('admin', 'UserRH')
  async obtener(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.obtenerNomina(id);
  }

  @Put(':id')
  @Roles('admin')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateNominaDto,
  ) {
    return this.nominaService.actualizarNomina(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.eliminarNomina(id);
  }

  @Patch(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id_nomina: number,
    @Body() dto: UpdateEstadoNominaDto
  ) {
    return this.nominaService.actualizarEstadoNomina(id_nomina, dto.estado);
  }

  //_________________________Detalle Nomina______________________________
  @Post(':id/detalles')
  @UseGuards(NominaEditableGuard)
  async crearDetalle(
    @Param('id', ParseIntPipe) id_nomina: number,
    @Body() dto: CreateDetalleNominaDto
  ) {
    return this.nominaService.crearDetalleNomina(id_nomina, dto);
  }

  @Get(':id/detalles')
  async listarDetalles(@Param('id', ParseIntPipe) id_nomina: number) {
    return this.nominaService.listarDetallesNomina(id_nomina);
  }

  @Get('detalles/:id')
  async obtenerDetalle(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.obtenerDetalleNomina(id_detalle);
  }

  @Put('detalles/:id')
  @UseGuards(NominaEditableGuard)
  async actualizarDetalle(
    @Param('id', ParseIntPipe) id_detalle: number,
    @Body() dto: UpdateDetalleNominaDto
  ) {
    return this.nominaService.actualizarDetalleNomina(id_detalle, dto);
  }

  @Delete('detalles/:id')
  @UseGuards(NominaEditableGuard)
  async eliminarDetalle(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.eliminarDetalleNomina(id_detalle);
  }

  //________________________Detalle Concepto Nomina_______________________
  @Post('detalles/:id/conceptos')
  @UseGuards(NominaEditableGuard)
  async crearDetalleConcepto(
    @Param('id', ParseIntPipe) id_detalle: number,
    @Body() dto: CreateDetalleConceptoDto
  ) {
    return this.nominaService.crearDetalleConcepto(id_detalle, dto);
  }

  @Get('detalles/:id/conceptos')
  async listarDetalleConceptos(@Param('id', ParseIntPipe) id_detalle: number) {
    return this.nominaService.listarDetalleConceptos(id_detalle);
  }

  @Get('conceptos/:id')
  async obtenerDetalleConcepto(@Param('id', ParseIntPipe) id_detalle_concepto: number) {
    return this.nominaService.obtenerDetalleConcepto(id_detalle_concepto);
  }

  @Put('conceptos/:id')
  @UseGuards(NominaEditableGuard)
  async actualizarDetalleConcepto(
    @Param('id', ParseIntPipe) id_detalle_concepto: number,
    @Body() dto: UpdateDetalleConceptoDto
  ) {
    return this.nominaService.actualizarDetalleConcepto(id_detalle_concepto, dto);
  }

  @Delete('conceptos/:id')
  @UseGuards(NominaEditableGuard)
  async eliminarDetalleConcepto(@Param('id', ParseIntPipe) id_detalle_concepto: number) {
    return this.nominaService.eliminarDetalleConcepto(id_detalle_concepto);
  }

  //_________________________Calcular Nomina______________________________

  @Post(':id/recalcular')
  @UseGuards(NominaEditableGuard)
  async recalcular(@Param('id', ParseIntPipe) id: number) {
    return this.nominaService.recalcularNomina(id);
  }
}
