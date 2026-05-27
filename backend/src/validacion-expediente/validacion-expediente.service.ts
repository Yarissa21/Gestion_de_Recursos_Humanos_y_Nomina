import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ValidacionExpedienteService {
  constructor(private prisma: PrismaService) {}

  async validarEmpleado(id_empleado: number) {
    const [tiposExpediente, tiposAcademicos, docsExpediente, academicos] = await Promise.all([
      this.prisma.tipoDocumento.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.tipoDocumentoAcademico.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.documentoExpediente.findMany({ where: { id_empleado, eliminado: false } }),
      this.prisma.informacionAcademica.findMany({
        where: { id_empleado, eliminado: false } as any,
        include: { documentos: { where: { eliminado: false } } },
      }),
    ]);

    const docsAcademicos = academicos.flatMap((a) => a.documentos);

    const faltantesExpediente = tiposExpediente.filter(
      (tipo) => !docsExpediente.some((doc) => doc.id_tipo === tipo.id_tipo)
    );
    const faltantesAcademicos = tiposAcademicos.filter(
      (tipo) => !docsAcademicos.some((doc) => doc.id_tipo_doc_academico === tipo.id_tipo_doc_academico)
    );

    const totalObligatorios = tiposExpediente.length + tiposAcademicos.length;
    const totalSubidos =
      (tiposExpediente.length - faltantesExpediente.length) +
      (tiposAcademicos.length - faltantesAcademicos.length);

    const estado =
      totalSubidos === 0 ? 'INCOMPLETO'
      : totalSubidos < totalObligatorios ? 'EN_PROCESO'
      : 'COMPLETO';

    const existente = await this.prisma.validacionExpediente.findUnique({
      where: { id_empleado },
    });

    if (existente) {
      await this.prisma.validacionExpediente.update({
        where: { id_empleado },
        data: { estado, fecha: new Date() },
      });
    } else {
      await this.prisma.validacionExpediente.create({
        data: { id_empleado, estado, fecha: new Date() },
      });
    }

    return {
      id_empleado,
      estado,
      total_obligatorios: totalObligatorios,
      total_subidos: totalSubidos,
      faltantes: {
        expediente: faltantesExpediente.map((t) => t.nombre),
        academicos: faltantesAcademicos.map((t) => t.nombre),
      },
    };
  }

  async resumenTodos() {
    const [empleados, tiposExpediente, tiposAcademicos, todosDocsExp, todosAcademicos] = await Promise.all([
      this.prisma.empleado.findMany({ where: { eliminado: false } }),
      this.prisma.tipoDocumento.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.tipoDocumentoAcademico.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.documentoExpediente.findMany({
        where: { eliminado: false },
        select: { id_empleado: true, id_tipo: true },
      }),
      this.prisma.informacionAcademica.findMany({
        where: { eliminado: false } as any,
        select: {
          id_empleado: true,
          documentos: {
            where: { eliminado: false },
            select: { id_tipo_doc_academico: true },
          },
        },
      }),
    ]);

    return empleados.map((emp) => {
      const docsExp = todosDocsExp.filter((d) => d.id_empleado === emp.id_empleado);
      const academicosEmp = todosAcademicos.filter((a) => a.id_empleado === emp.id_empleado);
      const docsAcad = academicosEmp.flatMap((a) => a.documentos);

      const subidosExp = tiposExpediente.filter(
        (t) => docsExp.some((d) => d.id_tipo === t.id_tipo)
      ).length;
      const subidosAcad = tiposAcademicos.filter(
        (t) => docsAcad.some((d) => d.id_tipo_doc_academico === t.id_tipo_doc_academico)
      ).length;

      const totalObligatorios = tiposExpediente.length + tiposAcademicos.length;
      const totalSubidos = subidosExp + subidosAcad;

      const estado =
        totalSubidos === 0 ? 'INCOMPLETO'
        : totalSubidos < totalObligatorios ? 'EN_PROCESO'
        : 'COMPLETO';

      return {
        empleado: {
          id: emp.id_empleado,
          nombre: emp.nombre_empleado,
          apellido: emp.apellido_empleado,
        },
        id_empleado: emp.id_empleado,
        estado,
        total_obligatorios: totalObligatorios,
        total_subidos: totalSubidos,
      };
    });
  }

  async validarTodos() {
    const [empleados, tiposExpediente, tiposAcademicos, todosDocsExp, todosAcademicos] = await Promise.all([
      this.prisma.empleado.findMany({ where: { eliminado: false } }),
      this.prisma.tipoDocumento.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.tipoDocumentoAcademico.findMany({ where: { obligatorio: true, eliminado: false } }),
      this.prisma.documentoExpediente.findMany({ where: { eliminado: false } }),
      this.prisma.informacionAcademica.findMany({
        where: { eliminado: false } as any,
        include: { documentos: { where: { eliminado: false } } },
      }),
    ]);

    const resultados = empleados.map((emp) => {
      const docsExp = todosDocsExp.filter((d) => d.id_empleado === emp.id_empleado);
      const academicosEmp = todosAcademicos.filter((a) => a.id_empleado === emp.id_empleado);
      const docsAcad = academicosEmp.flatMap((a) => a.documentos);

      const faltantesExpediente = tiposExpediente.filter(
        (tipo) => !docsExp.some((doc) => doc.id_tipo === tipo.id_tipo)
      );
      const faltantesAcademicos = tiposAcademicos.filter(
        (tipo) => !docsAcad.some((doc) => doc.id_tipo_doc_academico === tipo.id_tipo_doc_academico)
      );

      const totalObligatorios = tiposExpediente.length + tiposAcademicos.length;
      const totalSubidos =
        (tiposExpediente.length - faltantesExpediente.length) +
        (tiposAcademicos.length - faltantesAcademicos.length);

      const estado =
        totalSubidos === 0 ? 'INCOMPLETO'
        : totalSubidos < totalObligatorios ? 'EN_PROCESO'
        : 'COMPLETO';

      return {
        empleado: {
          id: emp.id_empleado,
          nombre: emp.nombre_empleado,
          apellido: emp.apellido_empleado,
        },
        id_empleado: emp.id_empleado,
        estado,
        total_obligatorios: totalObligatorios,
        total_subidos: totalSubidos,
        faltantes: {
          expediente: faltantesExpediente.map((t) => t.nombre),
          academicos: faltantesAcademicos.map((t) => t.nombre),
        },
      };
    });

    await Promise.all(
      resultados.map(async (r) => {
        const existente = await this.prisma.validacionExpediente.findUnique({
          where: { id_empleado: r.id_empleado },
        });
        if (existente) {
          await this.prisma.validacionExpediente.update({
            where: { id_empleado: r.id_empleado },
            data: { estado: r.estado, fecha: new Date() },
          });
        } else {
          await this.prisma.validacionExpediente.create({
            data: { id_empleado: r.id_empleado, estado: r.estado, fecha: new Date() },
          });
        }
      })
    );

    return resultados;
  }

  async obtenerValidacionesGuardadas() {
    return this.prisma.validacionExpediente.findMany({
      include: { empleado: true },
    });
  }
}