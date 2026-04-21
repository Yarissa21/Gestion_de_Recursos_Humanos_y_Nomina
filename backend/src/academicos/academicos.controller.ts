import { Controller, Post, Body, Get, Put, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { AcademicosService } from './academicos.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';
import { CreateDocumentoAcademicoDto } from './dto/create-documento-academico.dto';

@Controller('academicos')
export class AcademicosController {
  constructor(private readonly academicosService: AcademicosService) {}

  @Post()
  async crear(@Body() dto: CreateAcademicoDto) {
    return this.academicosService.crearAcademico(dto);
  }

  @Get()
  async listar() {
    return this.academicosService.listarAcademicos();
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicoDto
  ) {
    return this.academicosService.actualizarAcademico(id, dto);
  }

  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.academicosService.eliminarAcademico(id);
  }

  @Post('documento')
    async subirDocumento(@Body() dto: CreateDocumentoAcademicoDto) {
    return this.academicosService.subirDocumento(dto);
    }
}