import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}