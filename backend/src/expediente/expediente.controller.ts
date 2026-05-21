import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  ParseIntPipe,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Query,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ExpedienteService } from './expediente.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';

@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly service: ExpedienteService) {}

  // ============================
  // DOCUMENTOS EXPEDIENTE
  // ============================

  @Post('documento')
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(
    @UploadedFile() file: any,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe enviar el archivo en el campo "file"',
      );
    }

    const base64 = file.buffer.toString('base64');

    return this.service.subirDocumento({
      nombre_documento: file.originalname,
      archivo: base64,
      fecha_carga: new Date(),
      id_tipo: Number(body.id_tipo),
      id_empleado: Number(body.id_empleado),
      id_usuario: Number(body.id_usuario),
    });
  }

  @Get('documentos')
  async listarDocumentos() {
    return this.service.listarDocumentos();
  }

  @Get('documento/:id')
  async obtenerDocumento(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.obtenerDocumento(id);
  }

  @Get('documentos/empleado/:id')
  async obtenerPorEmpleado(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.obtenerDocumentosPorEmpleado(id);
  }

  @Get('documento/:id/archivo')
  async verArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Query('download') download: string,
  ) {
    const doc = await this.service.obtenerDocumento(id);

    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    const buffer = Buffer.from(doc.archivo, 'base64');

    const esDescarga = download === 'true';

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: esDescarga
        ? `attachment; filename="${doc.nombre_documento}"`
        : `inline; filename="${doc.nombre_documento}"`,
    });
  }

  @Put('documento/:id')
  @UseInterceptors(FileInterceptor('file'))
  async actualizarDocumento(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body() body: any,
  ) {
    let data: any = {
      nombre_documento: body.nombre_documento,
      id_tipo: body.id_tipo
        ? Number(body.id_tipo)
        : undefined,
    };

    if (file) {
      data.archivo = file.buffer.toString('base64');
    }

    return this.service.actualizarDocumento(id, data);
  }

  @Delete('documento/:id')
  async eliminarDocumento(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.eliminarDocumento(id);
  }

  // ============================
  // TIPOS DOCUMENTO
  // ============================

  @Post('tipo')
  async crearTipo(@Body() dto: CreateTipoDocumentoDto) {
    return this.service.crearTipoDocumento(dto);
  }

  @Get('tipos')
  async listarTipos() {
    return this.service.listarTiposDocumento();
  }

  @Get('tipo/:id')
  async obtenerTipo(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.obtenerTipoDocumento(id);
  }

  @Put('tipo/:id')
  async actualizarTipo(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTipoDocumentoDto,
  ) {
    return this.service.actualizarTipoDocumento(id, dto);
  }

  @Delete('tipo/:id')
  async eliminarTipo(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.service.eliminarTipoDocumento(id);
  }

}