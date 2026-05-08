import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const PdfPrinter = require('pdfmake/src/printer');

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  private fonts = {
    Roboto: {
      normal:
        'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',

      bold:
        'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',

      italics:
        'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',

      bolditalics:
        'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf',
    },
  };

  // ============================
  // CREAR PDF
  // ============================

  private generarPDF(
    contenido: any[],
    titulo: string,
    res: any,
  ) {
    const docDefinition = {
      content: contenido,

      styles: {
        header: {
          fontSize: 20,
          bold: true,
        },

        subheader: {
          fontSize: 15,
          bold: true,
        },
      },
    };

    const printer = new PdfPrinter(this.fonts);

    const pdfDoc =
      printer.createPdfKitDocument(docDefinition);

    res.setHeader(
      'Content-Type',
      'application/pdf',
    );

    res.setHeader(
      'Content-Disposition',
      `inline; filename=${titulo}.pdf`,
    );

    pdfDoc.pipe(res);

    pdfDoc.end();
  }

  // ============================
  // REPORTE GENERAL NÓMINAS
  // ============================

  async generarReporteNominas(res: any) {
    const nominas = await this.prisma.nomina.findMany({
      where: {
        eliminado: false,
      },

      include: {
        detalles: {
          include: {
            empleado: true,

            conceptos: {
              include: {
                concepto: true,
              },
            },
          },
        },
      },
    });

    const contenido: any[] = [];

    contenido.push({
      text: 'REPORTE GENERAL DE NÓMINAS',
      style: 'header',
    });

    for (const nomina of nominas) {
      contenido.push({
        text: `\nNÓMINA #${nomina.id_nomina}`,
        style: 'subheader',
      });

      contenido.push(
        `Periodo: ${nomina.periodo}`,
      );

      contenido.push(
        `Tipo: ${nomina.tipo}`,
      );

      contenido.push(
        `Estado: ${nomina.estado}`,
      );

      contenido.push(
        `Fecha: ${new Date(
          nomina.fecha_creacion,
        ).toLocaleDateString()}`,
      );

      contenido.push('\n');

      for (const detalle of nomina.detalles) {
        contenido.push({
          text:
            `Empleado: ${detalle.empleado.nombre_empleado} ` +
            `${detalle.empleado.apellido_empleado}`,
          bold: true,
        });

        contenido.push(
          `Salario base: Q${detalle.salario_base}`,
        );

        contenido.push(
          `Horas trabajadas: ${detalle.horas_trabajadas}`,
        );

        contenido.push(
          `Horas extra: ${detalle.horas_extra}`,
        );

        contenido.push(
          `Total líquido: Q${detalle.total_liquido}`,
        );

        contenido.push({
          text: 'Conceptos:',
          bold: true,
        });

        for (const concepto of detalle.conceptos) {
          contenido.push(
            `- ${concepto.concepto.nombre}: Q${concepto.monto}`,
          );
        }

        contenido.push('\n');
      }
    }

    return this.generarPDF(
      contenido,
      'nominas',
      res,
    );
  }

  // ============================
  // REPORTE NÓMINA POR ID
  // ============================

  async generarReporteNominaPorId(
    id: number,
    res: any,
  ) {
    const nomina = await this.prisma.nomina.findUnique({
      where: {
        id_nomina: id,
      },

      include: {
        detalles: {
          include: {
            empleado: true,

            conceptos: {
              include: {
                concepto: true,
              },
            },
          },
        },
      },
    });

    if (!nomina) {
      throw new NotFoundException(
        `La nómina con ID ${id} no existe`,
      );
    }

    const contenido: any[] = [];

    contenido.push({
      text: `REPORTE NÓMINA #${nomina.id_nomina}`,
      style: 'header',
    });

    contenido.push(
      `Periodo: ${nomina.periodo}`,
    );

    contenido.push(
      `Tipo: ${nomina.tipo}`,
    );

    contenido.push(
      `Estado: ${nomina.estado}`,
    );

    contenido.push('\n');

    for (const detalle of nomina.detalles) {
      contenido.push({
        text:
          `${detalle.empleado.nombre_empleado} ` +
          `${detalle.empleado.apellido_empleado}`,
        style: 'subheader',
      });

      contenido.push(
        `Salario Base: Q${detalle.salario_base}`,
      );

      contenido.push(
        `Horas Trabajadas: ${detalle.horas_trabajadas}`,
      );

      contenido.push(
        `Horas Extra: ${detalle.horas_extra}`,
      );

      contenido.push(
        `Total Líquido: Q${detalle.total_liquido}`,
      );

      contenido.push({
        text: 'Conceptos:',
        bold: true,
      });

      for (const concepto of detalle.conceptos) {
        contenido.push(
          `- ${concepto.concepto.nombre}: Q${concepto.monto}`,
        );
      }

      contenido.push('\n');
    }

    return this.generarPDF(
      contenido,
      `nomina_${id}`,
      res,
    );
  }

  // ============================
  // REPORTE GENERAL EXPEDIENTES
  // ============================

  async generarReporteExpedientes(res: any) {
    const tiposDocumentos =
      await this.prisma.tipoDocumento.findMany({
        where: {
          eliminado: false,
        },
      });

    const empleados =
      await this.prisma.empleado.findMany({
        where: {
          eliminado: false,
        },

        include: {
          validacion: true,

          documentos: {
            include: {
              tipo: true,
            },
          },
        },
      });

    const contenido: any[] = [];

    contenido.push({
      text: 'REPORTE DE EXPEDIENTES',
      style: 'header',
    });

    for (const emp of empleados) {
      contenido.push({
        text:
          `\n${emp.nombre_empleado} ` +
          `${emp.apellido_empleado}`,
        style: 'subheader',
      });

      contenido.push(`DPI: ${emp.dpi}`);

      contenido.push(
        `Estado expediente: ${
          emp.validacion?.estado ||
          'SIN VALIDAR'
        }`,
      );

      contenido.push({
        text: 'Documentos Subidos:',
        bold: true,
      });

      for (const doc of emp.documentos) {
        contenido.push(
          `- ${doc.tipo.nombre}`,
        );
      }

      const idsSubidos = emp.documentos.map(
        (d) => d.id_tipo,
      );

      const faltantes = tiposDocumentos.filter(
        (tipo) =>
          !idsSubidos.includes(tipo.id_tipo),
      );

      contenido.push({
        text: 'Documentos Faltantes:',
        bold: true,
      });

      if (faltantes.length === 0) {
        contenido.push(
          '- No hay documentos faltantes',
        );
      } else {
        for (const faltante of faltantes) {
          contenido.push(
            `- ${faltante.nombre}`,
          );
        }
      }
    }

    return this.generarPDF(
      contenido,
      'expedientes',
      res,
    );
  }

  // ============================
  // REPORTE EXPEDIENTE EMPLEADO
  // ============================

  async generarReporteExpedienteEmpleado(
    id: number,
    res: any,
  ) {
    const tiposDocumentos =
      await this.prisma.tipoDocumento.findMany({
        where: {
          eliminado: false,
        },
      });

    const emp =
      await this.prisma.empleado.findUnique({
        where: {
          id_empleado: id,
        },

        include: {
          validacion: true,

          documentos: {
            include: {
              tipo: true,
            },
          },
        },
      });

    if (!emp) {
      throw new NotFoundException(
        `El empleado con ID ${id} no existe`,
      );
    }

    const contenido: any[] = [];

    contenido.push({
      text: 'REPORTE EXPEDIENTE EMPLEADO',
      style: 'header',
    });

    contenido.push({
      text:
        `${emp.nombre_empleado} ` +
        `${emp.apellido_empleado}`,
      style: 'subheader',
    });

    contenido.push(`DPI: ${emp.dpi}`);

    contenido.push(
      `Estado: ${
        emp.validacion?.estado ||
        'SIN VALIDAR'
      }`,
    );

    contenido.push({
      text: 'Documentos Subidos:',
      bold: true,
    });

    for (const doc of emp.documentos) {
      contenido.push(
        `- ${doc.tipo.nombre}`,
      );
    }

    const idsSubidos = emp.documentos.map(
      (d) => d.id_tipo,
    );

    const faltantes = tiposDocumentos.filter(
      (tipo) =>
        !idsSubidos.includes(tipo.id_tipo),
    );

    contenido.push({
      text: 'Documentos Faltantes:',
      bold: true,
    });

    if (faltantes.length === 0) {
      contenido.push(
        '- No hay documentos faltantes',
      );
    } else {
      for (const faltante of faltantes) {
        contenido.push(
          `- ${faltante.nombre}`,
        );
      }
    }

    return this.generarPDF(
      contenido,
      `expediente_${id}`,
      res,
    );
  }

  // ============================
  // REPORTE GENERAL ACADÉMICO
  // ============================

  async generarReporteAcademicos(res: any) {
    const empleados =
      await this.prisma.empleado.findMany({
        where: {
          eliminado: false,
        },

        include: {
          academicos: {
            include: {
              documentos: {
                include: {
                  tipo_doc: true,
                },
              },
            },
          },
        },
      });

    const contenido: any[] = [];

    contenido.push({
      text: 'REPORTE ACADÉMICO',
      style: 'header',
    });

    for (const emp of empleados) {
      contenido.push({
        text:
          `\n${emp.nombre_empleado} ` +
          `${emp.apellido_empleado}`,
        style: 'subheader',
      });

      for (const acad of emp.academicos) {
        contenido.push(
          `Título: ${acad.titulo}`,
        );

        contenido.push(
          `Institución: ${acad.institucion}`,
        );

        contenido.push(
          `Certificación: ${acad.certificacion}`,
        );

        contenido.push(
          `Fecha Graduación: ${new Date(
            acad.fecha_graduacion,
          ).toLocaleDateString()}`,
        );

        contenido.push({
          text: 'Documentos Académicos:',
          bold: true,
        });

        for (const doc of acad.documentos) {
          contenido.push(
            `- ${doc.tipo_doc.nombre}`,
          );
        }

        contenido.push('\n');
      }
    }

    return this.generarPDF(
      contenido,
      'academicos',
      res,
    );
  }

  // ============================
  // REPORTE ACADÉMICO EMPLEADO
  // ============================

  async generarReporteAcademicoEmpleado(
    id: number,
    res: any,
  ) {
    const emp =
      await this.prisma.empleado.findUnique({
        where: {
          id_empleado: id,
        },

        include: {
          academicos: {
            include: {
              documentos: {
                include: {
                  tipo_doc: true,
                },
              },
            },
          },
        },
      });

    if (!emp) {
      throw new NotFoundException(
        `El empleado con ID ${id} no existe`,
      );
    }

    const contenido: any[] = [];

    contenido.push({
      text: 'REPORTE ACADÉMICO EMPLEADO',
      style: 'header',
    });

    contenido.push({
      text:
        `${emp.nombre_empleado} ` +
        `${emp.apellido_empleado}`,
      style: 'subheader',
    });

    for (const acad of emp.academicos) {
      contenido.push(
        `Título: ${acad.titulo}`,
      );

      contenido.push(
        `Institución: ${acad.institucion}`,
      );

      contenido.push(
        `Certificación: ${acad.certificacion}`,
      );

      contenido.push({
        text: 'Documentos:',
        bold: true,
      });

      for (const doc of acad.documentos) {
        contenido.push(
          `- ${doc.tipo_doc.nombre}`,
        );
      }

      contenido.push('\n');
    }

    return this.generarPDF(
      contenido,
      `academico_${id}`,
      res,
    );
  }
}