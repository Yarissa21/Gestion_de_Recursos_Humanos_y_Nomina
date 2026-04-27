import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

@Injectable()
export class ConceptoNominaService {
  constructor(private prisma: PrismaService) {}

  async crearConcepto(dto: CreateConceptoDto) {
    return this.prisma.conceptoNomina.create({ data: dto });
  }

  async listarConceptos() {
    return this.prisma.conceptoNomina.findMany({ where: { eliminado: false } });
  }

  async obtenerConcepto(id_concepto: number) {
    const concepto = await this.prisma.conceptoNomina.findUnique({ where: { id_concepto } });
    if (!concepto || concepto.eliminado) {
      throw new NotFoundException('Concepto no encontrado');
    }
    return concepto;
  }

  async actualizarConcepto(id_concepto: number, dto: UpdateConceptoDto) {
    await this.obtenerConcepto(id_concepto);
    return this.prisma.conceptoNomina.update({
      where: { id_concepto },
      data: dto,
    });
  }

  async eliminarConcepto(id_concepto: number) {
    await this.obtenerConcepto(id_concepto);
    return this.prisma.conceptoNomina.update({
      where: { id_concepto },
      data: { eliminado: true },
    });
  }
}