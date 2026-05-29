import {
  Controller, Post, Body, Get, Put,
  Param, Delete, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TipoDocumentoAcademicoService } from './tipo_documento_academico.service';
import { CreateTipoDocumentoAcademicoDto } from './dto/create-tipo-documento-academico.dto';
import { UpdateTipoDocumentoAcademicoDto } from './dto/update-tipo-documento-academico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Tipos Documento Académico')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tipos-documento-academico')
export class TipoDocumentoAcademicoController {
  constructor(private readonly service: TipoDocumentoAcademicoService) {}

  @ApiOperation({ summary: 'Crear tipo de documento académico' })
  @ApiResponse({ status: 201, description: 'Tipo creado correctamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese nombre' })
  @Roles('admin')
  @Post()
  crear(@Body() dto: CreateTipoDocumentoAcademicoDto) {
    return this.service.crear(dto);
  }

  @ApiOperation({ summary: 'Listar tipos de documento académico activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de documento académico' })
  @Roles('admin', 'UserRH', 'user')
  @Get()
  listar() {
    return this.service.listar();
  }

  @ApiOperation({ summary: 'Obtener tipo de documento académico por ID' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles('admin', 'UserRH')
  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @ApiOperation({ summary: 'Actualizar tipo de documento académico' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese nombre' })
  @Roles('admin')
  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDocumentoAcademicoDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar tipo de documento académico (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tipo eliminado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles('admin')
  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}