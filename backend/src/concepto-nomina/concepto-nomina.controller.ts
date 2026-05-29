import { Controller, Post, Get, Put, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConceptoNominaService } from './concepto-nomina.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Conceptos de Nómina')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('conceptos')
export class ConceptoNominaController {
  constructor(private readonly conceptoService: ConceptoNominaService) {}

  @ApiOperation({ summary: 'Crear concepto de nómina' })
  @ApiResponse({ status: 201, description: 'Concepto creado correctamente' })
  @ApiResponse({ status: 400, description: 'Tipo inválido o más de un campo opcional activo' })
  @ApiResponse({ status: 409, description: 'Ya existe un concepto con ese nombre' })
  @Roles('admin')
  @Post()
  async crear(@Body() dto: CreateConceptoDto) {
    return this.conceptoService.crearConcepto(dto);
  }

  @ApiOperation({ summary: 'Listar todos los conceptos activos' })
  @ApiResponse({ status: 200, description: 'Lista de conceptos' })
  @Roles('admin')
  @Get()
  async listar() {
    return this.conceptoService.listarConceptos();
  }

  @ApiOperation({ summary: 'Obtener concepto por ID' })
  @ApiResponse({ status: 200, description: 'Concepto encontrado' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Roles('admin')
  @Get(':id')
  async obtener(@Param('id', ParseIntPipe) id_concepto: number) {
    return this.conceptoService.obtenerConcepto(id_concepto);
  }

  @ApiOperation({ summary: 'Actualizar concepto' })
  @ApiResponse({ status: 200, description: 'Concepto actualizado' })
  @ApiResponse({ status: 400, description: 'Tipo inválido o más de un campo opcional activo' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un concepto con ese nombre' })
  @Roles('admin')
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id_concepto: number,
    @Body() dto: UpdateConceptoDto,
  ) {
    return this.conceptoService.actualizarConcepto(id_concepto, dto);
  }

  @ApiOperation({ summary: 'Eliminar concepto (soft delete)' })
  @ApiResponse({ status: 200, description: 'Concepto eliminado' })
  @ApiResponse({ status: 404, description: 'Concepto no encontrado' })
  @Roles('admin')
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id_concepto: number) {
    return this.conceptoService.eliminarConcepto(id_concepto);
  }
}