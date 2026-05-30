import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Departamentos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @ApiOperation({ summary: 'Crear departamento' })
  @ApiResponse({ status: 201, description: 'Departamento creado correctamente' })
  @ApiResponse({ status: 400, description: 'Nombre vacío' })
  @ApiResponse({ status: 409, description: 'Ya existe un departamento con ese nombre' })
  @Roles('admin')
  @Post()
  async crear(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.crearDepartamento(dto);
  }

  @ApiOperation({ summary: 'Listar departamentos activos' })
  @ApiResponse({ status: 200, description: 'Lista de departamentos' })
  @Roles('admin', 'UserRH')
  @Get()
  async listar() {
    return this.departamentosService.listarDepartamentos();
  }

  @ApiOperation({ summary: 'Actualizar departamento' })
  @ApiResponse({ status: 200, description: 'Departamento actualizado' })
  @ApiResponse({ status: 400, description: 'Nombre vacío' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un departamento con ese nombre' })
  @Roles('admin')
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.actualizarDepartamento(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar departamento (soft delete)' })
  @ApiResponse({ status: 200, description: 'Departamento eliminado' })
  @ApiResponse({ status: 400, description: 'Tiene empleados o puestos asignados' })
  @ApiResponse({ status: 404, description: 'Departamento no encontrado' })
  @Roles('admin')
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.eliminarDepartamento(id);
  }
}