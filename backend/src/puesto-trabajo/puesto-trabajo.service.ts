import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePuestoTrabajoDto } from './dto/create-puesto-trabajo.dto';
import { UpdatePuestoTrabajoDto } from './dto/update-puesto-trabajo.dto';

@Injectable()
export class PuestoTrabajoService {
  constructor(private prisma: PrismaService) {}

  crearPuesto(data: CreatePuestoTrabajoDto) {
    return this.prisma.puestoTrabajo.create({ data });
  }

  listarPuestos() {
    return this.prisma.puestoTrabajo.findMany({
      include: { departamento: true },
    });
  }

  obtenerPuesto(id: number) {
    return this.prisma.puestoTrabajo.findUnique({
      where: { id_puesto: id },
      include: { departamento: true, },
    });
  }

  actualizarPuesto(id: number, data: UpdatePuestoTrabajoDto) {
    return this.prisma.puestoTrabajo.update({
      where: { id_puesto: id },
      data,
    });
  }

  eliminarPuesto(id: number) {
    return this.prisma.puestoTrabajo.update({
      where: { id_puesto: id },
      data: { eliminado: true },
    });
  }
}
