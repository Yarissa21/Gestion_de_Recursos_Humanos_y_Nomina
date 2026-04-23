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

  @Delete(':id/:id_empleado')
  async eliminar(
    @Param('id', ParseIntPipe) id: number,
    @Param('id_empleado', ParseIntPipe) id_empleado: number,
  ) {
    return this.academicosService.eliminarAcademico(
      id,
      id_empleado,
    );
  }

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
}