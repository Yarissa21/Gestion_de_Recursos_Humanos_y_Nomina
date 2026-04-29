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
  Req, 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AcademicosService } from './academicos.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';
import { Query, NotFoundException } from '@nestjs/common';
import { StreamableFile } from '@nestjs/common';

@Controller('academicos')
export class AcademicosController {
  constructor(private readonly academicosService: AcademicosService) {}

  // ============================
  // ACADÉMICOS
  // ============================

  @Post()
  async crear(@Body() dto: CreateAcademicoDto) {
    return this.academicosService.crearAcademico(dto);
  }

  @Get()
  async listar() {
    return this.academicosService.listarAcademicos();
  }

  @Get('empleado/:id')
  async obtenerPorEmpleado(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.academicosService.obtenerPorEmpleado(id);
  }

  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicoDto,
  ) {
    if (!dto.id_empleado) {
      throw new BadRequestException('id_empleado es requerido');
    }

    return this.academicosService.actualizarAcademico(
      id,
      dto,
      dto.id_empleado,
    );
  }

  @Delete('academico/:id/:id_empleado')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_empleado', ParseIntPipe) id_empleado: number,
  ) {
    return this.academicosService.eliminarAcademico(
      id,
      id_empleado,
    );
  }

  // ============================
  // DOCUMENTOS ACADÉMICOS
  // ============================

  @Post('documento')
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException(
        'Debe enviar el archivo en el campo "file"',
      );
    }

    const base64 = file.buffer.toString('base64');

    return this.academicosService.subirDocumento({
      nombre: file.originalname,
      archivo: base64,
      fecha_carga: new Date(),
      id_academico: Number(body.id_academico),
      id_tipo_doc_academico: Number(body.id_tipo_doc_academico),
      id_usuario: Number(body.id_usuario),
    });
  }

  @Get('documentos')
  async listarDocumentos() {
    return this.academicosService.listarDocumentos();
  }

  @Get('documento/:id')
  async obtenerDocumento(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.academicosService.obtenerDocumento(id);
  }

  @Get('documento/:id/archivo')
  async verArchivo(
    @Param('id', ParseIntPipe) id: number,
    @Query('download') download: string,
  ) {
    const doc = await this.academicosService.obtenerDocumento(id);

    if (!doc) {
      throw new NotFoundException('Documento no encontrado');
    }

    const buffer = Buffer.from(doc.archivo, 'base64');

    const esDescarga = download === 'true';

    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: esDescarga
        ? `attachment; filename="${doc.nombre}"`
        : `inline; filename="${doc.nombre}"`,
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
      nombre: body.nombre,
      id_tipo_doc_academico: body.id_tipo_doc_academico
        ? Number(body.id_tipo_doc_academico)
        : undefined,
    };

    if (file) {
      data.archivo = file.buffer.toString('base64');
    }

    return this.academicosService.actualizarDocumento(id, data);
  }

  @Delete('documento/:id')
  async eliminarDocumento(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.academicosService.eliminarDocumento(id);
  }
  
}