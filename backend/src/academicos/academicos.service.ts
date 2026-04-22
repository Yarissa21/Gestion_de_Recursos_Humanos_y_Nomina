import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';

@Injectable()
export class AcademicosService {
  constructor(private prisma: PrismaService) {}

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

  async actualizarAcademico(id: number, dto: UpdateAcademicoDto) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
    });

    if (!academico) {
      throw new NotFoundException(`Académico con id ${id} no existe`);
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

  async eliminarAcademico(id: number) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
    });

    if (!academico) {
      throw new NotFoundException(`Académico con id ${id} no existe`);
    }

    return this.prisma.informacionAcademica.update({
      where: { id_academico: id },
      data: { eliminado: true } as any,
    });
  }

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
}
