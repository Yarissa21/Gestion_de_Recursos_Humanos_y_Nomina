import {
  Controller, Post, Body, Get, Put, Param, ParseIntPipe,
  Delete, UseInterceptors, UploadedFile, BadRequestException,
  Query, NotFoundException, StreamableFile, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { ExpedienteService } from './expediente.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Expediente')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expediente')
export class ExpedienteController {
  constructor(private readonly service: ExpedienteService) {}

  // ============================
  // DOCUMENTOS EXPEDIENTE
  // ============================

  @ApiOperation({ summary: 'Subir documento de expediente (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:        { type: 'string', format: 'binary', description: 'Archivo PDF' },
        id_tipo:     { type: 'number', example: 1, description: 'ID del tipo de documento' },
        id_empleado: { type: 'number', example: 1, description: 'ID del empleado' },
        id_usuario:  { type: 'number', example: 1, description: 'ID del usuario que sube el archivo' },
      },
      required: ['file', 'id_tipo', 'id_empleado', 'id_usuario'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido correctamente' })
  @ApiResponse({ status: 400, description: 'Archivo no enviado o empleado/tipo no existe' })
  @Roles('admin', 'UserRH', 'user')
  @Post('documento')
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(@UploadedFile() file: any, @Body() body: any) {
    if (!file) throw new BadRequestException('Debe enviar el archivo en el campo "file"');
    const base64 = file.buffer.toString('base64');
    return this.service.subirDocumento({
      nombre_documento: file.originalname,
      archivo: base64,
      fecha_carga: new Date(),
      id_tipo:     Number(body.id_tipo),
      id_empleado: Number(body.id_empleado),
      id_usuario:  Number(body.id_usuario),
    });
  }

  @ApiOperation({ summary: 'Listar todos los documentos de expediente' })
  @ApiResponse({ status: 200, description: 'Lista de documentos' })
  @Roles('admin', 'UserRH')
  @Get('documentos')
  async listarDocumentos() {
    return this.service.listarDocumentos();
  }

  @ApiOperation({ summary: 'Obtener documento por ID' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin', 'UserRH')
  @Get('documento/:id')
  async obtenerDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerDocumento(id);
  }

  @ApiOperation({ summary: 'Obtener documentos de un empleado específico' })
  @ApiResponse({ status: 200, description: 'Lista de documentos del empleado' })
  @Roles('admin', 'UserRH')
  @Get('documentos/empleado/:id')
  async obtenerPorEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerDocumentosPorEmpleado(id);
  }

  @ApiOperation({ summary: 'Ver o descargar archivo PDF del documento' })
  @ApiQuery({ name: 'download', required: false, example: 'true', description: 'Si es true descarga el archivo, si no lo muestra en línea' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('documento/:id/archivo')
  async verArchivo(@Param('id', ParseIntPipe) id: number, @Query('download') download: string) {
    const doc = await this.service.obtenerDocumento(id);
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const buffer  = Buffer.from(doc.archivo, 'base64');
    const esDescarga = download === 'true';
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: esDescarga
        ? `attachment; filename="${doc.nombre_documento}"`
        : `inline; filename="${doc.nombre_documento}"`,
    });
  }

  @ApiOperation({ summary: 'Actualizar documento de expediente' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:             { type: 'string', format: 'binary', description: 'Nuevo archivo PDF (opcional)' },
        nombre_documento: { type: 'string', example: 'DPI_Actualizado.pdf', description: 'Nuevo nombre del documento' },
        id_tipo:          { type: 'number', example: 1, description: 'Nuevo tipo de documento' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Documento actualizado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Put('documento/:id')
  @UseInterceptors(FileInterceptor('file'))
  async actualizarDocumento(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any, @Body() body: any) {
    const data: any = {
      nombre_documento: body.nombre_documento,
      id_tipo: body.id_tipo ? Number(body.id_tipo) : undefined,
    };
    if (file) data.archivo = file.buffer.toString('base64');
    return this.service.actualizarDocumento(id, data);
  }

  @ApiOperation({ summary: 'Eliminar documento de expediente (soft delete)' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin')
  @Delete('documento/:id')
  async eliminarDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarDocumento(id);
  }

  // ============================
  // TIPOS DOCUMENTO
  // ============================

  @ApiOperation({ summary: 'Crear tipo de documento de expediente' })
  @ApiResponse({ status: 201, description: 'Tipo creado correctamente' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese nombre' })
  @Roles('admin')
  @Post('tipo')
  async crearTipo(@Body() dto: CreateTipoDocumentoDto) {
    return this.service.crearTipoDocumento(dto);
  }

  @ApiOperation({ summary: 'Listar tipos de documento activos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos de documento' })
  @Roles('admin', 'UserRH', 'user')
  @Get('tipos')
  async listarTipos() {
    return this.service.listarTiposDocumento();
  }

  @ApiOperation({ summary: 'Obtener tipo de documento por ID' })
  @ApiResponse({ status: 200, description: 'Tipo encontrado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles('admin', 'UserRH')
  @Get('tipo/:id')
  async obtenerTipo(@Param('id', ParseIntPipe) id: number) {
    return this.service.obtenerTipoDocumento(id);
  }

  @ApiOperation({ summary: 'Actualizar tipo de documento' })
  @ApiResponse({ status: 200, description: 'Tipo actualizado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un tipo con ese nombre' })
  @Roles('admin')
  @Put('tipo/:id')
  async actualizarTipo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTipoDocumentoDto) {
    return this.service.actualizarTipoDocumento(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar tipo de documento (soft delete)' })
  @ApiResponse({ status: 200, description: 'Tipo eliminado' })
  @ApiResponse({ status: 404, description: 'Tipo no encontrado' })
  @Roles('admin')
  @Delete('tipo/:id')
  async eliminarTipo(@Param('id', ParseIntPipe) id: number) {
    return this.service.eliminarTipoDocumento(id);
  }
}