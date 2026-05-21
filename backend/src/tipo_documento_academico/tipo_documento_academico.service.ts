import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoDocumentoAcademicoDto } from './dto/create-tipo-documento-academico.dto';
import { UpdateTipoDocumentoAcademicoDto } from './dto/update-tipo-documento-academico.dto';

@Injectable()
export class TipoDocumentoAcademicoService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateTipoDocumentoAcademicoDto) {
    return this.prisma.tipoDocumentoAcademico.create({
      data: {
        nombre: dto.nombre,
        obligatorio: dto.obligatorio,
      },
    });
  }

  async listar() {
    return this.prisma.tipoDocumentoAcademico.findMany({
      where: { eliminado: false },
    });
  }

  async obtener(id: number) {
    const tipo = await this.prisma.tipoDocumentoAcademico.findUnique({
      where: { id_tipo_doc_academico: id },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    }

    return tipo;
  }

  async actualizar(id: number, dto: UpdateTipoDocumentoAcademicoDto) {
    await this.obtener(id);

    return this.prisma.tipoDocumentoAcademico.update({
      where: { id_tipo_doc_academico: id },
      data: dto,
    });
  }

  async eliminar(id: number) {
    await this.obtener(id);

    return this.prisma.tipoDocumentoAcademico.update({
      where: { id_tipo_doc_academico: id },
      data: { eliminado: true },
    });
  }
}