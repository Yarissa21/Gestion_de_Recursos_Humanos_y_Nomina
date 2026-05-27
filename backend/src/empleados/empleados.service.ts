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

  async miPerfilCompleto(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      include: { empleado: true },
    });

    if (!usuario?.empleado) return null;

    const id_empleado = usuario.empleado.id_empleado;

    const [empleado, tiposExp, tiposAcad, docsExp, academicos] = await Promise.all([
      this.prisma.empleado.findUnique({ where: { id_empleado } }),
      this.prisma.tipoDocumento.findMany({ where: { eliminado: false } }),
      this.prisma.tipoDocumentoAcademico.findMany({ where: { eliminado: false } }),
      this.prisma.documentoExpediente.findMany({
        where: { id_empleado, eliminado: false },
        select: {
          id_documento: true,
          nombre_documento: true,
          fecha_carga: true,
          id_tipo: true,
          tipo: { select: { nombre: true } },
        },
      }),
      this.prisma.informacionAcademica.findMany({
        where: { id_empleado, eliminado: false } as any,
        include: {
          documentos: {
            where: { eliminado: false },
            select: {
              id_doc_academico: true,
              nombre: true,
              fecha_carga: true,
              id_academico: true,
              id_tipo_doc_academico: true,
              tipo_doc: { select: { nombre: true } },
            },
          },
        },
      }),
    ]);

    return { empleado, tiposExp, tiposAcad, docsExp, academicos };
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
