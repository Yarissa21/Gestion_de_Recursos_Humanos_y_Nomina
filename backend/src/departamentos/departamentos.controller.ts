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
import { DepartamentosService } from './departamentos.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('departamentos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Post()
  @Roles('admin')
  async crear(@Body() dto: CreateDepartamentoDto) {
    return this.departamentosService.crearDepartamento(dto);
  }

  @Get()
  @Roles('admin', 'UserRH')
  async listar() {
    return this.departamentosService.listarDepartamentos();
  }

  @Put(':id')
  @Roles('admin')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartamentoDto,
  ) {
    return this.departamentosService.actualizarDepartamento(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.departamentosService.eliminarDepartamento(id);
  }
}
