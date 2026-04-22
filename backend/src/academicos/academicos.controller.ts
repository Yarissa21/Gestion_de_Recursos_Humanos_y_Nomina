import {Controller,Post,Body,Get,Put,Param,ParseIntPipe,Delete,UseInterceptors,UploadedFile,BadRequestException} from '@nestjs/common';
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
  @UseInterceptors(FileInterceptor('file'))
  async subirDocumento(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('Debe enviar el archivo en el campo "file"');
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