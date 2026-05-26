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

  async obtenerPerfilPropio(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      include: { empleado: true },
    });
    if (!usuario?.empleado) {
      throw new NotFoundException('No tienes un perfil de empleado vinculado');
    }
    return usuario.empleado;
  }

  async crearEmpleado(data: CreateEmpleadoDto) {
    if (!data.dpi || !data.nombre_empleado || !data.apellido_empleado) {
      throw new BadRequestException(
        'El empleado debe tener DPI y nombre completo',
      );
    }

    const puesto = await this.prisma.puestoTrabajo.findUnique({
      where: { id_puesto: data.id_puesto },
    });

    if (!puesto || puesto.id_departamento !== data.id_departamento) {
      throw new BadRequestException('El puesto no pertenece al departamento seleccionado');
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

    if (data.id_puesto || data.id_departamento) {
      const departamentoFinal = data.id_departamento ?? empleado.id_departamento;
      const puestoFinal = data.id_puesto ?? empleado.id_puesto;

      const puesto = await this.prisma.puestoTrabajo.findUnique({
        where: { id_puesto: puestoFinal },
      });

      if (!puesto || puesto.id_departamento !== departamentoFinal) {
        throw new BadRequestException(
          'El puesto no pertenece al departamento seleccionado'
        );
      }
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
