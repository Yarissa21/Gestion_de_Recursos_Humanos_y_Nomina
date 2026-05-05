import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';

@Injectable()
export class ExpedienteService {
  constructor(private prisma: PrismaService) {}

  // ============================
  // DOCUMENTOS EXPEDIENTE
  // ============================

  async subirDocumento(data: any) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: data.id_empleado },
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con id ${data.id_empleado} no existe`,
      );
    }

    return this.prisma.documentoExpediente.create({
      data,
    });
  }

  async listarDocumentos() {
    return this.prisma.documentoExpediente.findMany({
      where: { eliminado: false },
      include: {
        empleado: true,
        tipo: true,
        usuario: true,
      },
    });
  }

  async obtenerDocumento(id: number) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });

    if (!doc) {
      throw new NotFoundException(
        `Documento con id ${id} no existe`,
      );
    }

    return doc;
  }

  async obtenerDocumentosPorEmpleado(id_empleado: number) {
    return this.prisma.documentoExpediente.findMany({
      where: {
        id_empleado,
        eliminado: false,
      },
      include: {
        tipo: true,
        usuario: true,
        empleado: true,
      },
    });
  }

  async actualizarDocumento(id: number, dto: any) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });

    if (!doc) {
      throw new NotFoundException(
        `Documento con id ${id} no existe`,
      );
    }

    return this.prisma.documentoExpediente.update({
      where: { id_documento: id },
      data: dto,
    });
  }

  async eliminarDocumento(id: number) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });

    if (!doc) {
      throw new NotFoundException(
        `Documento con id ${id} no existe`,
      );
    }

    return this.prisma.documentoExpediente.update({
      where: { id_documento: id },
      data: { eliminado: true },
    });
  }

  // ============================
  // TIPOS DOCUMENTO
  // ============================

  async crearTipoDocumento(dto: CreateTipoDocumentoDto) {
    return this.prisma.tipoDocumento.create({
      data: {
        nombre: dto.nombre,
        obligatorio: dto.obligatorio,
      },
    });
  }

  async listarTiposDocumento() {
    return this.prisma.tipoDocumento.findMany({
      where: { eliminado: false },
    });
  }

  async obtenerTipoDocumento(id: number) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: {
        id_tipo: id,
        eliminado: false,
      },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    }

    return tipo;
  }

  async actualizarTipoDocumento(id: number, dto: UpdateTipoDocumentoDto) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: {
        id_tipo: id,
        eliminado: false,
      },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    }

    return this.prisma.tipoDocumento.update({
      where: { id_tipo: id },
      data: dto,
    });
  }

  async eliminarTipoDocumento(id: number) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: {
        id_tipo: id,
        eliminado: false,
      },
    });

    if (!tipo) {
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    }

    return this.prisma.tipoDocumento.update({
      where: { id_tipo: id },
      data: { eliminado: true },
    });
  }

}