import {Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';

@Injectable()
export class AcademicosService {
  constructor(private prisma: PrismaService) {}

  // ============================
  // ACADÉMICOS
  // ============================

  async crearAcademico(dto: CreateAcademicoDto) {
    return this.prisma.informacionAcademica.create({
      data: {
        titulo: dto.titulo,
        certificacion: dto.certificacion,
        institucion: dto.institucion,
        fecha_graduacion: dto.fecha_graduacion,
        id_empleado: dto.id_empleado,
      },
    });
  }

  async listarAcademicos() {
    return this.prisma.informacionAcademica.findMany({
      where: { eliminado: false } as any,
      include: { empleado: true },
    });
  }

  async obtenerPorEmpleado(id_empleado: number) {
    return this.prisma.informacionAcademica.findMany({
      where: {
        id_empleado,
        eliminado: false,
      } as any,
      include: {
        empleado: true,
      },
    });
  }

  async actualizarAcademico(
    id: number,
    dto: UpdateAcademicoDto,
    id_empleado: number,
  ) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
    });

    if (!academico) {
      throw new NotFoundException(`Académico con id ${id} no existe`);
    }

    if (academico.id_empleado !== id_empleado) {
      throw new ForbiddenException(
        'No tienes permiso para editar este registro',
      );
    }

    return this.prisma.informacionAcademica.update({
      where: { id_academico: id },
      data: {
        titulo: dto.titulo,
        certificacion: dto.certificacion,
        institucion: dto.institucion,
        fecha_graduacion: dto.fecha_graduacion,
      },
    });
  }

  async eliminarAcademico(id: number, id_empleado: number) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
    });

    if (!academico) {
      throw new NotFoundException(`Académico con id ${id} no existe`);
    }

    if (academico.id_empleado !== id_empleado) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este registro',
      );
    }

    return this.prisma.informacionAcademica.update({
      where: { id_academico: id },
      data: { eliminado: true } as any,
    });
  }

  // ============================
  // DOCUMENTOS ACADÉMICOS
  // ============================

  async subirDocumento(data: any) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: data.id_academico },
    });

    if (!academico) {
      throw new NotFoundException(
        `Académico con id ${data.id_academico} no existe`,
      );
    }

    return this.prisma.documentoAcademico.create({
      data,
    });
  }

  async listarDocumentos() {
    return this.prisma.documentoAcademico.findMany({
      where: { eliminado: false },
      include: {
        academico: true,
        tipo_doc: true,
        usuario: true,
      },
    });
  }

  async obtenerDocumento(id: number) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
    });

    if (!doc) {
      throw new NotFoundException(`Documento con id ${id} no existe`);
    }

    return doc;
  }

  async actualizarDocumento(id: number, dto: any) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
    });

    if (!doc) {
      throw new NotFoundException(`Documento con id ${id} no existe`);
    }

    return this.prisma.documentoAcademico.update({
      where: { id_doc_academico: id },
      data: dto,
    });
  }

  async eliminarDocumento(id: number) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
    });

    if (!doc) {
      throw new NotFoundException(`Documento con id ${id} no existe`);
    }

    return this.prisma.documentoAcademico.update({
      where: { id_doc_academico: id },
      data: { eliminado: true },
    });
  }
}