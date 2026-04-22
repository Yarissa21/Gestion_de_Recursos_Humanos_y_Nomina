import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EstadoEmpleado } from '@prisma/client';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  async crearEmpleado(data: CreateEmpleadoDto) {
    if (!data.dpi || !data.nombre_empleado || !data.apellido_empleado) {
      throw new BadRequestException(
        'El empleado debe tener DPI y nombre completo',
      );
    }

    return this.prisma.empleado.create({ data });
  }

  async listarEmpleados() {
    return this.prisma.empleado.findMany({
      where: {
        eliminado: false,
      },
    });
  }

  async actualizarEmpleado(id: number, data: UpdateEmpleadoDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });
    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }

    return this.prisma.empleado.update({
      where: { id_empleado: id },
      data,
    });
  }

  async eliminarEmpleado(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }

    return this.prisma.empleado.update({
      where: { id_empleado: id },
      data: { eliminado: true },
    });
  }

  async actualizarEstadoEmpleado(id: number, estado: EstadoEmpleado) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con id ${id} no existe`);
    }

    return this.prisma.empleado.update({
      where: { id_empleado: id },
      data: { estado },
    });
  }
}
