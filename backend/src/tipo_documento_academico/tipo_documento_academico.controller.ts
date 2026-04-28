import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { TipoDocumentoAcademicoService } from './tipo_documento_academico.service';
import { CreateTipoDocumentoAcademicoDto } from './dto/create-tipo-documento-academico.dto';
import { UpdateTipoDocumentoAcademicoDto } from './dto/update-tipo-documento-academico.dto';

@Controller('tipos-documento-academico')
export class TipoDocumentoAcademicoController {
  constructor(private readonly service: TipoDocumentoAcademicoService) {}

  @Post()
  crear(@Body() dto: CreateTipoDocumentoAcademicoDto) {
    return this.service.crear(dto);
  }

  @Get()
  listar() {
    return this.service.listar();
  }

  @Get(':id')
  obtener(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtener(id);
  }

  @Put(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDocumentoAcademicoDto,
  ) {
    return this.service.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminar(id);
  }
}