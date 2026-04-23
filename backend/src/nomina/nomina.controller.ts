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
} from '@nestjs/common';
import { NominaService } from './nomina.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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
}
