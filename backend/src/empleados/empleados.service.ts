import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EstadoEmpleado } from '@prisma/client';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  private validarEdad(fecha_nacimiento: Date | string) {
    const hoy = new Date();
    const nacimiento = new Date(fecha_nacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const cumplioEsteAnio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
    const edadReal = cumplioEsteAnio ? edad : edad - 1;

    if (edadReal < 18)
      throw new BadRequestException('El empleado debe tener al menos 18 años');
    if (edadReal > 100)
      throw new BadRequestException('La fecha de nacimiento no puede ser mayor a 100 años atrás');
  }

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
    this.validarEdad(data.fecha_nacimiento);

    if (!Number.isInteger(data.salario))
      throw new BadRequestException('El salario debe ser un número entero');

    const puesto = await this.prisma.puestoTrabajo.findUnique({
      where: { id_puesto: data.id_puesto },
    });

    if (!puesto || puesto.eliminado)
      throw new NotFoundException('El puesto seleccionado no existe');

    if (puesto.id_departamento !== data.id_departamento)
      throw new BadRequestException('El puesto no pertenece al departamento seleccionado');

    const dpiExistente = await this.prisma.empleado.findFirst({
      where: { dpi: data.dpi, eliminado: false },
    });
    if (dpiExistente)
      throw new ConflictException('Ya existe un empleado con ese DPI');

    const correoExistente = await this.prisma.empleado.findFirst({
      where: { correo: data.correo, eliminado: false },
    });
    if (correoExistente)
      throw new ConflictException('Ya existe un empleado con ese correo');

    return this.prisma.empleado.create({ data });
  }

  async listarEmpleados() {
    return this.prisma.empleado.findMany({
      where: { eliminado: false },
    });
  }

  async actualizarEmpleado(id: number, data: UpdateEmpleadoDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });
    if (!empleado || empleado.eliminado)
      throw new NotFoundException(`Empleado con id ${id} no existe`);

    if (data.fecha_nacimiento)
      this.validarEdad(data.fecha_nacimiento);

    if (data.salario !== undefined && !Number.isInteger(data.salario))
      throw new BadRequestException('El salario debe ser un número entero');

    if (data.id_puesto || data.id_departamento) {
      const departamentoFinal = data.id_departamento ?? empleado.id_departamento;
      const puestoFinal = data.id_puesto ?? empleado.id_puesto;

      const puesto = await this.prisma.puestoTrabajo.findUnique({
        where: { id_puesto: puestoFinal },
      });

      if (!puesto || puesto.eliminado)
        throw new NotFoundException('El puesto seleccionado no existe');

      if (puesto.id_departamento !== departamentoFinal)
        throw new BadRequestException('El puesto no pertenece al departamento seleccionado');
    }

    if (data.dpi) {
      const dpiExistente = await this.prisma.empleado.findFirst({
        where: { dpi: data.dpi, eliminado: false, NOT: { id_empleado: id } },
      });
      if (dpiExistente)
        throw new ConflictException('Ya existe un empleado con ese DPI');
    }

    if (data.correo) {
      const correoExistente = await this.prisma.empleado.findFirst({
        where: { correo: data.correo, eliminado: false, NOT: { id_empleado: id } },
      });
      if (correoExistente)
        throw new ConflictException('Ya existe un empleado con ese correo');
    }

    return this.prisma.empleado.update({
      where: { id_empleado: id },
      data,
    });
  }

  async eliminarEmpleado(id: number) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: {
        academicos: {
          where: { eliminado: false },
          include: { documentos: { where: { eliminado: false } } },
        },
        documentos: { where: { eliminado: false } },
        detalles: {
          where: { eliminado: false },
          include: { conceptos: { where: { eliminado: false } } },
        },
      },
    });

    if (!empleado || empleado.eliminado)
      throw new NotFoundException(`Empleado con id ${id} no existe`);

    const idAcademicos  = empleado.academicos.map((a) => a.id_academico);
    const idDocsAcad    = empleado.academicos.flatMap((a) => a.documentos.map((d) => d.id_doc_academico));
    const idDocsExp     = empleado.documentos.map((d) => d.id_documento);
    const idDetalles    = empleado.detalles.map((d) => d.id_detalle);
    const idConceptos   = empleado.detalles.flatMap((d) => d.conceptos.map((c) => c.id_detalle_concepto));

    await this.prisma.$transaction(async (tx) => {
      if (idDocsAcad.length > 0)
        await tx.documentoAcademico.updateMany({ where: { id_doc_academico: { in: idDocsAcad } }, data: { eliminado: true } });

      if (idAcademicos.length > 0)
        await tx.informacionAcademica.updateMany({ where: { id_academico: { in: idAcademicos } }, data: { eliminado: true } });

      if (idDocsExp.length > 0)
        await tx.documentoExpediente.updateMany({ where: { id_documento: { in: idDocsExp } }, data: { eliminado: true } });

      if (idConceptos.length > 0)
        await tx.detalleConceptoNomina.updateMany({ where: { id_detalle_concepto: { in: idConceptos } }, data: { eliminado: true } });

      if (idDetalles.length > 0)
        await tx.detalleNomina.updateMany({ where: { id_detalle: { in: idDetalles } }, data: { eliminado: true } });

      await tx.validacionExpediente.deleteMany({ where: { id_empleado: id } });

      await tx.usuario.updateMany({ where: { id_empleado: id }, data: { id_empleado: null } });

      await tx.empleado.update({ where: { id_empleado: id }, data: { eliminado: true } });
    });

    return { message: `Empleado ${id} eliminado correctamente` };
  }

  async actualizarEstadoEmpleado(id: number, estado: EstadoEmpleado) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });

    if (!empleado || empleado.eliminado)
      throw new NotFoundException(`Empleado con id ${id} no existe`);

    return this.prisma.empleado.update({
      where: { id_empleado: id },
      data: { estado },
    });
  }
}