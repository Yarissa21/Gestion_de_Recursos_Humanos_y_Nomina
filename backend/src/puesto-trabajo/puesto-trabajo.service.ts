import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePuestoTrabajoDto } from './dto/create-puesto-trabajo.dto';
import { UpdatePuestoTrabajoDto } from './dto/update-puesto-trabajo.dto';

@Injectable()
export class PuestoTrabajoService {
  constructor(private prisma: PrismaService) {}

  async crearPuesto(data: CreatePuestoTrabajoDto) {
    if (!data.nombre_puesto?.trim())
      throw new BadRequestException('El nombre del puesto es obligatorio');

    const departamento = await this.prisma.departamento.findUnique({
      where: { id_departamento: data.id_departamento },
    });
    if (!departamento || departamento.eliminado)
      throw new NotFoundException('El departamento seleccionado no existe');

    const existente = await this.prisma.puestoTrabajo.findFirst({
      where: {
        nombre_puesto: { equals: data.nombre_puesto.trim(), mode: 'insensitive' },
        id_departamento: data.id_departamento,
        eliminado: false,
      },
    });
    if (existente)
      throw new ConflictException(`Ya existe el puesto "${data.nombre_puesto}" en ese departamento`);

    return this.prisma.puestoTrabajo.create({
      data: { ...data, nombre_puesto: data.nombre_puesto.trim() },
    });
  }

  listarPuestos() {
    return this.prisma.puestoTrabajo.findMany({
      where: { eliminado: false },
      include: { departamento: true },
    });
  }

  async obtenerPuesto(id: number) {
    const puesto = await this.prisma.puestoTrabajo.findUnique({
      where: { id_puesto: id },
      include: { departamento: true },
    });
    if (!puesto || puesto.eliminado)
      throw new NotFoundException(`Puesto con id ${id} no existe`);
    return puesto;
  }

  async actualizarPuesto(id: number, data: UpdatePuestoTrabajoDto) {
    const puesto = await this.obtenerPuesto(id);

    if (data.nombre_puesto !== undefined && !data.nombre_puesto.trim())
      throw new BadRequestException('El nombre del puesto no puede estar vacío');

    const departamentoFinal = data.id_departamento ?? puesto.id_departamento;

    if (data.id_departamento) {
      const departamento = await this.prisma.departamento.findUnique({
        where: { id_departamento: data.id_departamento },
      });
      if (!departamento || departamento.eliminado)
        throw new NotFoundException('El departamento seleccionado no existe');
    }

    if (data.nombre_puesto) {
      const existente = await this.prisma.puestoTrabajo.findFirst({
        where: {
          nombre_puesto: { equals: data.nombre_puesto.trim(), mode: 'insensitive' },
          id_departamento: departamentoFinal,
          eliminado: false,
          NOT: { id_puesto: id },
        },
      });
      if (existente)
        throw new ConflictException(`Ya existe el puesto "${data.nombre_puesto}" en ese departamento`);
    }

    return this.prisma.puestoTrabajo.update({
      where: { id_puesto: id },
      data: {
        ...data,
        ...(data.nombre_puesto && { nombre_puesto: data.nombre_puesto.trim() }),
      },
    });
  }

  async eliminarPuesto(id: number) {
    await this.obtenerPuesto(id);

    const empleadosAsignados = await this.prisma.empleado.count({
      where: { id_puesto: id, eliminado: false },
    });
    if (empleadosAsignados > 0)
      throw new BadRequestException(`No se puede eliminar el puesto porque tiene ${empleadosAsignados} empleado(s) asignado(s)`);

    return this.prisma.puestoTrabajo.update({
      where: { id_puesto: id },
      data: { eliminado: true },
    });
  }
}