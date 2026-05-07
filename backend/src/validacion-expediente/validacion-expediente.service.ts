import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ValidacionExpedienteService {
  constructor(private prisma: PrismaService) {}

  async validarEmpleado(id_empleado: number) {
    // ============================
    // TIPOS OBLIGATORIOS
    // ============================

    const tiposExpediente = await this.prisma.tipoDocumento.findMany({
      where: { obligatorio: true, eliminado: false },
    });

    const tiposAcademicos =
      await this.prisma.tipoDocumentoAcademico.findMany({
        where: { obligatorio: true, eliminado: false },
      });

    // ============================
    // DOCUMENTOS EXPEDIENTE
    // ============================

    const docsExpediente =
      await this.prisma.documentoExpediente.findMany({
        where: {
          id_empleado,
          eliminado: false,
        },
      });

    // ============================
    // DOCUMENTOS ACADÉMICOS
    // ============================

    const academicos =
      await this.prisma.informacionAcademica.findMany({
        where: {
          id_empleado,
          eliminado: false,
        },
        include: {
          documentos: true,
        },
      });

    let docsAcademicos: any[] = [];

    for (const a of academicos) {
      for (const d of a.documentos) {
        if (!d.eliminado) {
          docsAcademicos.push(d);
        }
      }
    }

    // ============================
    // VALIDACIONES
    // ============================

    const faltantesExpediente = tiposExpediente.filter(tipo =>
      !docsExpediente.some(doc => doc.id_tipo === tipo.id_tipo),
    );

    const faltantesAcademicos = tiposAcademicos.filter(tipo =>
      !docsAcademicos.some(
        doc =>
          doc.id_tipo_doc_academico ===
          tipo.id_tipo_doc_academico,
      ),
    );

    // ============================
    // CONTADORES
    // ============================

    const totalObligatorios =
      tiposExpediente.length + tiposAcademicos.length;

    const totalSubidos =
      (tiposExpediente.length - faltantesExpediente.length) +
      (tiposAcademicos.length - faltantesAcademicos.length);

    // ============================
    // ESTADO
    // ============================

    let estado = 'INCOMPLETO';

    if (totalSubidos === 0) estado = 'INCOMPLETO';
    else if (totalSubidos < totalObligatorios)
      estado = 'EN_PROCESO';
    else estado = 'COMPLETO';

    // ============================
    // CONTROL REAL (NO DUPLICAR)
    // ============================

    const existente =
      await this.prisma.validacionExpediente.findUnique({
        where: { id_empleado },
      });

    if (existente) {
      await this.prisma.validacionExpediente.update({
        where: { id_empleado },
        data: {
          estado,
          fecha: new Date(),
        },
      });
    } else {
      await this.prisma.validacionExpediente.create({
        data: {
          id_empleado,
          estado,
          fecha: new Date(),
        },
      });
    }

    // ============================
    // RESPUESTA
    // ============================

    return {
      id_empleado,
      estado,
      total_obligatorios: totalObligatorios,
      total_subidos: totalSubidos,
      faltantes: {
        expediente: faltantesExpediente.map(t => t.nombre),
        academicos: faltantesAcademicos.map(t => t.nombre),
      },
    };
  }

  // ============================
  // VALIDAR TODOS
  // ============================

  async validarTodos() {
    const empleados = await this.prisma.empleado.findMany({
      where: { eliminado: false },
    });

    const resultados: any[] = [];

    for (const emp of empleados) {
      const validacion = await this.validarEmpleado(emp.id_empleado);

      resultados.push({
        empleado: {
          id: emp.id_empleado,
          nombre: emp.nombre_empleado,
          apellido: emp.apellido_empleado,
        },
        id_empleado: validacion.id_empleado,
        estado: validacion.estado,
        total_obligatorios: validacion.total_obligatorios,
        total_subidos: validacion.total_subidos,
        faltantes: validacion.faltantes,
      });
    }

    return resultados;
  }
}