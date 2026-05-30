import {
  Controller, Post, Body, Get, Put, Param, ParseIntPipe,
  Delete, UseInterceptors, UploadedFile, BadRequestException,
  Query, NotFoundException, StreamableFile, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { AcademicosService } from './academicos.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Académicos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academicos')
export class AcademicosController {
  constructor(private readonly academicosService: AcademicosService) {}

  // ============================
  // ACADÉMICOS
  // ============================

  @ApiOperation({ summary: 'Crear registro de información académica' })
  @ApiResponse({ status: 201, description: 'Registro académico creado correctamente' })
  @ApiResponse({ status: 400, description: 'Fecha futura o empleado ya tiene registro' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin', 'UserRH')
  @Post()
  async crear(@Body() dto: CreateAcademicoDto) {
    return this.academicosService.crearAcademico(dto);
  }

  @ApiOperation({ summary: 'Listar todos los registros académicos' })
  @ApiResponse({ status: 200, description: 'Lista de registros académicos' })
  @Roles('admin', 'UserRH')
  @Get()
  async listar() {
    return this.academicosService.listarAcademicos();
  }

  @ApiOperation({ summary: 'Obtener registros académicos por empleado' })
  @ApiResponse({ status: 200, description: 'Registros académicos del empleado' })
  @Roles('admin', 'UserRH')
  @Get('empleado/:id')
  async obtenerPorEmpleado(@Param('id', ParseIntPipe) id: number) {
    return this.academicosService.obtenerPorEmpleado(id);
  }

  @ApiOperation({ summary: 'Actualizar registro académico' })
  @ApiResponse({ status: 200, description: 'Registro actualizado' })
  @ApiResponse({ status: 400, description: 'id_empleado requerido o fecha futura' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para editar este registro' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Roles('admin', 'UserRH')
  @Put(':id')
  async actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAcademicoDto,
  ) {
    if (!dto.id_empleado)
      throw new BadRequestException('id_empleado es requerido');
    return this.academicosService.actualizarAcademico(id, dto, dto.id_empleado);
  }

  @ApiOperation({ summary: 'Eliminar registro académico (soft delete en cascada)' })
  @ApiResponse({ status: 200, description: 'Registro eliminado correctamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar este registro' })
  @ApiResponse({ status: 404, description: 'Registro no encontrado' })
  @Roles('admin')
  @Delete('academico/:id/:id_empleado')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_empleado', ParseIntPipe) id_empleado: number,
  ) {
    return this.academicosService.eliminarAcademico(id, id_empleado);
  }

  // ============================
  // DOCUMENTOS ACADÉMICOS
  // ============================

  @ApiOperation({ summary: 'Subir documento académico (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:                  { type: 'string', format: 'binary', description: 'Archivo PDF' },
        id_academico:          { type: 'number', example: 1, description: 'ID del registro académico' },
        id_tipo_doc_academico: { type: 'number', example: 1, description: 'ID del tipo de documento académico' },
        id_usuario:            { type: 'number', example: 1, description: 'ID del usuario que sube el archivo' },
      },
      required: ['file', 'id_academico', 'id_tipo_doc_academico', 'id_usuario'],
    },
  })
  @ApiResponse({ status: 201, description: 'Documento subido correctamente' })
  @ApiResponse({ status: 400, description: 'Archivo no enviado o registro/tipo no existe' })
  @Roles('admin', 'UserRH', 'user')
  @Post('documento')
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(@UploadedFile() file: any, @Body() body: any) {
    if (!file)
      throw new BadRequestException('Debe enviar el archivo en el campo "file"');
    const base64 = file.buffer.toString('base64');
    return this.academicosService.subirDocumento({
      nombre:               file.originalname,
      archivo:              base64,
      fecha_carga:          new Date(),
      id_academico:         Number(body.id_academico),
      id_tipo_doc_academico: Number(body.id_tipo_doc_academico),
      id_usuario:           Number(body.id_usuario),
    });
  }

  @ApiOperation({ summary: 'Listar todos los documentos académicos' })
  @ApiResponse({ status: 200, description: 'Lista de documentos académicos' })
  @Roles('admin', 'UserRH', 'user')
  @Get('documentos')
  async listarDocumentos() {
    return this.academicosService.listarDocumentos();
  }

  @ApiOperation({ summary: 'Obtener documento académico por ID' })
  @ApiResponse({ status: 200, description: 'Documento encontrado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin', 'UserRH')
  @Get('documento/:id')
  async obtenerDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.academicosService.obtenerDocumento(id);
  }

  @ApiOperation({ summary: 'Ver o descargar archivo PDF académico' })
  @ApiQuery({ name: 'download', required: false, example: 'true', description: 'Si es true descarga el archivo, si no lo muestra en línea' })
  @ApiResponse({ status: 200, description: 'Archivo PDF' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('documento/:id/archivo')
  async verArchivo(@Param('id', ParseIntPipe) id: number, @Query('download') download: string) {
    const doc = await this.academicosService.obtenerDocumento(id);
    if (!doc) throw new NotFoundException('Documento no encontrado');
    const buffer    = Buffer.from(doc.archivo, 'base64');
    const esDescarga = download === 'true';
    return new StreamableFile(buffer, {
      type: 'application/pdf',
      disposition: esDescarga
        ? `attachment; filename="${doc.nombre}"`
        : `inline; filename="${doc.nombre}"`,
    });
  }

  @ApiOperation({ summary: 'Actualizar documento académico' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:                  { type: 'string', format: 'binary', description: 'Nuevo archivo PDF (opcional)' },
        nombre:                { type: 'string', example: 'Titulo_Actualizado.pdf', description: 'Nuevo nombre del documento' },
        id_tipo_doc_academico: { type: 'number', example: 1, description: 'Nuevo tipo de documento' },
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
      nombre: body.nombre,
      id_tipo_doc_academico: body.id_tipo_doc_academico ? Number(body.id_tipo_doc_academico) : undefined,
    };
    if (file) data.archivo = file.buffer.toString('base64');
    return this.academicosService.actualizarDocumento(id, data);
  }

  @ApiOperation({ summary: 'Eliminar documento académico (soft delete)' })
  @ApiResponse({ status: 200, description: 'Documento eliminado' })
  @ApiResponse({ status: 404, description: 'Documento no encontrado' })
  @Roles('admin')
  @Delete('documento/:id')
  async eliminarDocumento(@Param('id', ParseIntPipe) id: number) {
    return this.academicosService.eliminarDocumento(id);
  }
}