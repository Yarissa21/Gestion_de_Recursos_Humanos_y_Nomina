import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

const PdfPrinter = require('pdfmake/src/printer');

// ============================
// PALETA CORPORATIVA
// ============================
const COLOR_PRIMARY   = '#1E3A5F'; 
const COLOR_SECONDARY = '#2E86AB'; 
const COLOR_ACCENT    = '#F0F4F8'; 
const COLOR_WHITE     = '#FFFFFF';
const COLOR_TEXT      = '#2D3748';
const COLOR_MUTED     = '#718096';
const COLOR_SUCCESS   = '#276749'; 
const COLOR_WARNING   = '#744210'; 
const COLOR_SUCCESS_BG = '#F0FFF4';
const COLOR_WARNING_BG = '#FFFBEB';

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
  // HELPERS DE DISEÑO
  // ============================

  /** Encabezado corporativo reutilizable */
  private headerBlock(titulo: string, subtitulo?: string): any[] {
    return [
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  {
                    text: 'SISTEMA DE GESTIÓN DE RRHH',
                    fontSize: 9,
                    color: COLOR_SECONDARY,
                    bold: true,
                    letterSpacing: 1,
                  },
                  {
                    text: titulo,
                    fontSize: 20,
                    bold: true,
                    color: COLOR_WHITE,
                    margin: [0, 4, 0, 2],
                  },
                  ...(subtitulo
                    ? [{ text: subtitulo, fontSize: 11, color: '#A8C8E8', italics: true }]
                    : []),
                ],
                fillColor: COLOR_PRIMARY,
                margin: [20, 16, 20, 16],
              },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 16],
      },
    ];
  }

  /** Línea divisoria con etiqueta de sección */
  private seccionBlock(texto: string): any {
    return {
      table: {
        widths: ['*'],
        body: [[{ text: texto, bold: true, fontSize: 11, color: COLOR_WHITE, margin: [8, 5] }]],
      },
      layout: 'noBorders',
      fillColor: COLOR_SECONDARY,
      margin: [0, 10, 0, 6],
    };
  }

  /** Fila clave-valor dentro de una tarjeta de información */
  private filaInfo(clave: string, valor: string): any {
    return {
      columns: [
        { text: clave, bold: true, fontSize: 9, color: COLOR_MUTED, width: 130 },
        { text: valor || '—', fontSize: 9, color: COLOR_TEXT },
      ],
      margin: [0, 2, 0, 2],
    };
  }

  /** Badge de estado (color según valor) */
  private badgeEstado(estado: string): any {
    const estadoUpper = (estado || '').toUpperCase();
    let bg = '#E2E8F0';
    let fg = COLOR_TEXT;

    if (['PROCESADA', 'ACTIVO', 'APROBADO', 'COMPLETO'].includes(estadoUpper)) {
      bg = COLOR_SUCCESS_BG; fg = COLOR_SUCCESS;
    } else if (['PENDIENTE', 'SIN VALIDAR'].includes(estadoUpper)) {
      bg = COLOR_WARNING_BG; fg = COLOR_WARNING;
    } else if (['CERRADA', 'RETIRADO', 'SUSPENDIDO'].includes(estadoUpper)) {
      bg = '#FFF5F5'; fg = '#742A2A';
    }

    return {
      table: {
        body: [[{ text: estado || 'SIN VALIDAR', fontSize: 8, bold: true, color: fg, margin: [6, 3] }]],
      },
      layout: 'noBorders',
      fillColor: bg,
    };
  }

  /** Tabla genérica con header de color y filas alternas */
  private tablaConceptos(filas: any[][]): any {
    if (!filas.length) return { text: '' };

    const header = filas[0].map((celda) => ({
      text: String(celda),
      bold: true,
      fontSize: 9,
      color: COLOR_WHITE,
      fillColor: COLOR_PRIMARY,
      margin: [6, 5],
    }));

    const cuerpo = filas.slice(1).map((fila, i) =>
      fila.map((celda) => ({
        text: String(celda ?? '—'),
        fontSize: 9,
        color: COLOR_TEXT,
        fillColor: i % 2 === 0 ? COLOR_WHITE : COLOR_ACCENT,
        margin: [6, 4],
      })),
    );

    return {
      table: {
        headerRows: 1,
        widths: Array(filas[0].length).fill('*'),
        body: [header, ...cuerpo],
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => '#CBD5E0',
      },
      margin: [0, 4, 0, 8],
    };
  }

  /** Pie de página con fecha e índice */
  private footerFn() {
    return (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: `Generado el ${new Date().toLocaleDateString('es-GT', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}`,
          fontSize: 7,
          color: COLOR_MUTED,
          margin: [20, 0],
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'right',
          fontSize: 7,
          color: COLOR_MUTED,
          margin: [0, 0, 20, 0],
        },
      ],
      margin: [0, 4],
    });
  }

  // ============================
  // CREAR PDF
  // ============================

  private generarPDF(contenido: any[], titulo: string, res: any) {
    const docDefinition: any = {
      pageSize: 'LETTER',
      pageMargins: [30, 30, 30, 40],
      content: contenido,
      footer: this.footerFn(),
      defaultStyle: {
        font: 'Roboto',
        fontSize: 10,
        color: COLOR_TEXT,
      },
      styles: {
        header: { fontSize: 20, bold: true, color: COLOR_WHITE },
        subheader: { fontSize: 13, bold: true, color: COLOR_PRIMARY, margin: [0, 8, 0, 4] },
        label: { fontSize: 9, bold: true, color: COLOR_MUTED },
        value: { fontSize: 9, color: COLOR_TEXT },
        monto: { fontSize: 9, bold: true, color: COLOR_SUCCESS, alignment: 'right' },
      },
    };

    const printer = new PdfPrinter(this.fonts);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${titulo}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  // ============================
  // REPORTE GENERAL NÓMINAS
  // ============================

  async generarReporteNominas(res: any) {
    const nominas = await this.prisma.nomina.findMany({
      where: { eliminado: { not: true } },
      include: {
        detalles: {
          where: { eliminado: { not: true } },
          include: {
            empleado: true,
            conceptos: {
              where: { eliminado: { not: true } },
              include: { concepto: true },
            },
          },
        },
      },
    });

    const contenido: any[] = [
      ...this.headerBlock(
        'REPORTE GENERAL DE NÓMINAS',
        `Total de nóminas: ${nominas.length}`,
      ),
    ];

    for (const nomina of nominas) {
      contenido.push(
        this.seccionBlock(`Nómina #${nomina.id_nomina}  ·  ${nomina.periodo}`),
      );

      contenido.push({
        columns: [
          {
            stack: [
              this.filaInfo('Periodo', nomina.periodo),
              this.filaInfo('Tipo', nomina.tipo),
              this.filaInfo(
                'Fecha de creación',
                new Date(nomina.fecha_creacion).toLocaleDateString('es-GT'),
              ),
            ],
            width: '60%',
          },
          {
            stack: [
              { text: 'Estado', style: 'label', margin: [0, 2, 0, 4] },
              this.badgeEstado(nomina.estado),
            ],
            width: '40%',
            alignment: 'right',
          },
        ],
        margin: [0, 0, 0, 8],
      });

      if (nomina.detalles.length === 0) {
        contenido.push({
          text: 'Esta nómina no tiene detalles registrados.',
          italics: true,
          color: COLOR_MUTED,
          fontSize: 9,
          margin: [0, 0, 0, 10],
        });
        continue;
      }

      const filasEmpleados: any[][] = [
        ['Empleado', 'Salario Base', 'H. Trabajadas', 'H. Extra', 'Total Líquido'],
        ...nomina.detalles.map((d) => [
          `${d.empleado.nombre_empleado} ${d.empleado.apellido_empleado}`,
          `Q${Number(d.salario_base).toFixed(2)}`,
          String(d.horas_trabajadas),
          String(d.horas_extra),
          `Q${Number(d.total_liquido ?? 0).toFixed(2)}`,
        ]),
      ];

      contenido.push(this.tablaConceptos(filasEmpleados));

      for (const detalle of nomina.detalles) {
        if (detalle.conceptos.length === 0) continue;

        contenido.push({
          text: `Conceptos — ${detalle.empleado.nombre_empleado} ${detalle.empleado.apellido_empleado}`,
          fontSize: 9,
          bold: true,
          color: COLOR_SECONDARY,
          margin: [0, 6, 0, 2],
        });

        const filasConceptos: any[][] = [
          ['Concepto', 'Tipo', 'Monto'],
          ...detalle.conceptos.map((c) => [
            c.concepto.nombre,
            c.concepto.tipo,
            `Q${Number(c.monto).toFixed(2)}`,
          ]),
        ];

        contenido.push(this.tablaConceptos(filasConceptos));
      }
    }

    return this.generarPDF(contenido, 'nominas', res);
  }

  // ============================
  // REPORTE NÓMINA POR ID
  // ============================

  async generarReporteNominaPorId(id: number, res: any) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina: id },
      include: {
        detalles: {
          where: { eliminado: { not: true } },
          include: {
            empleado: true,
            conceptos: {
              where: { eliminado: { not: true } },
              include: { concepto: true },
            },
          },
        },
      },
    });

    if (!nomina) {
      throw new NotFoundException(`La nómina con ID ${id} no existe`);
    }

    const totalLiquido = nomina.detalles.reduce(
      (acc, d) => acc + Number(d.total_liquido ?? 0),
      0,
    );

    const contenido: any[] = [
      ...this.headerBlock(
        `NÓMINA #${nomina.id_nomina}`,
        `Periodo: ${nomina.periodo}  ·  Tipo: ${nomina.tipo}`,
      ),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            this.filaInfo('Periodo', nomina.periodo),
            this.filaInfo('Tipo', nomina.tipo),
            this.filaInfo(
              'Fecha',
              new Date(nomina.fecha_creacion).toLocaleDateString('es-GT'),
            ),
            this.filaInfo('Empleados', String(nomina.detalles.length)),
          ],
          width: '60%',
        },
        {
          stack: [
            { text: 'Estado', style: 'label', margin: [0, 2, 0, 4] },
            this.badgeEstado(nomina.estado),
            { text: ' ', margin: [0, 6] },
            { text: 'Total General', style: 'label', margin: [0, 2, 0, 2] },
            {
              text: `Q${totalLiquido.toFixed(2)}`,
              fontSize: 16,
              bold: true,
              color: COLOR_PRIMARY,
              alignment: 'right',
            },
          ],
          width: '40%',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 12],
    });

    for (const detalle of nomina.detalles) {
      contenido.push(
        this.seccionBlock(
          `${detalle.empleado.nombre_empleado} ${detalle.empleado.apellido_empleado}`,
        ),
      );

      contenido.push({
        columns: [
          {
            stack: [
              this.filaInfo('Salario Base', `Q${Number(detalle.salario_base).toFixed(2)}`),
              this.filaInfo('Horas Trabajadas', String(detalle.horas_trabajadas)),
              this.filaInfo('Horas Extra', String(detalle.horas_extra)),
              this.filaInfo(
                'Pago Horas Normales',
                detalle.pago_horas_normales != null
                  ? `Q${Number(detalle.pago_horas_normales).toFixed(2)}`
                  : '—',
              ),
              this.filaInfo(
                'Pago Horas Extra',
                detalle.pago_horas_extra != null
                  ? `Q${Number(detalle.pago_horas_extra).toFixed(2)}`
                  : '—',
              ),
            ],
          },
          {
            stack: [
              { text: 'Total Líquido', style: 'label', margin: [0, 2, 0, 4] },
              {
                text: `Q${Number(detalle.total_liquido ?? 0).toFixed(2)}`,
                fontSize: 18,
                bold: true,
                color: COLOR_SUCCESS,
                alignment: 'right',
              },
            ],
            alignment: 'right',
          },
        ],
        margin: [0, 4, 0, 8],
      });

      if (detalle.conceptos.length > 0) {
        contenido.push({ text: 'Conceptos aplicados', style: 'label', margin: [0, 0, 0, 4] });

        const filasConceptos: any[][] = [
          ['Concepto', 'Tipo', 'Monto'],
          ...detalle.conceptos.map((c) => [
            c.concepto.nombre,
            c.concepto.tipo,
            `Q${Number(c.monto).toFixed(2)}`,
          ]),
        ];

        contenido.push(this.tablaConceptos(filasConceptos));
      }
    }

    return this.generarPDF(contenido, `nomina_${id}`, res);
  }

  // ============================
  // REPORTE GENERAL EXPEDIENTES
  // ============================

  async generarReporteExpedientes(res: any) {
    const tiposDocumentos = await this.prisma.tipoDocumento.findMany({
      where: { eliminado: { not: true } },
    });

    const empleados = await this.prisma.empleado.findMany({
      where: { eliminado: { not: true } },
      include: {
        validacion: true,
        documentos: {
          where: { eliminado: { not: true } },
          include: { tipo: true },
        },
      },
    });

    const contenido: any[] = [
      ...this.headerBlock(
        'REPORTE DE EXPEDIENTES',
        `${empleados.length} empleados registrados`,
      ),
    ];

    const filasResumen: any[][] = [
      ['Empleado', 'DPI', 'Docs. Subidos', 'Docs. Faltantes', 'Estado'],
      ...empleados.map((emp) => {
        const idsSubidos = emp.documentos.map((d) => d.id_tipo);
        const faltantes = tiposDocumentos.filter(
          (t) => !idsSubidos.includes(t.id_tipo),
        );
        return [
          `${emp.nombre_empleado} ${emp.apellido_empleado}`,
          emp.dpi,
          String(emp.documentos.length),
          String(faltantes.length),
          emp.validacion?.estado || 'SIN VALIDAR',
        ];
      }),
    ];

    contenido.push({ text: 'Resumen General', style: 'subheader' });
    contenido.push(this.tablaConceptos(filasResumen));

    contenido.push(this.seccionBlock('DETALLE POR EMPLEADO'));

    for (const emp of empleados) {
      contenido.push({
        text: `${emp.nombre_empleado} ${emp.apellido_empleado}`,
        style: 'subheader',
      });

      const idsSubidos = emp.documentos.map((d) => d.id_tipo);
      const faltantes = tiposDocumentos.filter(
        (t) => !idsSubidos.includes(t.id_tipo),
      );

      contenido.push({
        columns: [
          { stack: [this.filaInfo('DPI', emp.dpi)], width: '50%' },
          {
            stack: [
              { text: 'Estado', style: 'label', margin: [0, 2, 0, 4] },
              this.badgeEstado(emp.validacion?.estado || 'SIN VALIDAR'),
            ],
            width: '50%',
            alignment: 'right',
          },
        ],
        margin: [0, 4, 0, 8],
      });

      contenido.push({
        columns: [
          {
            stack: [
              {
                text: `✔  Documentos Subidos (${emp.documentos.length})`,
                fontSize: 9,
                bold: true,
                color: COLOR_SUCCESS,
                margin: [0, 0, 0, 4],
              },
              ...emp.documentos.map((doc) => ({
                text: `· ${doc.tipo.nombre}`,
                fontSize: 9,
                color: COLOR_TEXT,
                margin: [6, 1],
              })),
            ],
            width: '50%',
          },
          {
            stack: [
              {
                text: `✘  Documentos Faltantes (${faltantes.length})`,
                fontSize: 9,
                bold: true,
                color: faltantes.length === 0 ? COLOR_MUTED : COLOR_WARNING,
                margin: [0, 0, 0, 4],
              },
              ...(faltantes.length === 0
                ? [{ text: 'Expediente completo', fontSize: 9, color: COLOR_MUTED, italics: true, margin: [6, 1] }]
                : faltantes.map((f) => ({
                    text: `· ${f.nombre}`,
                    fontSize: 9,
                    color: COLOR_WARNING,
                    margin: [6, 1],
                  }))),
            ],
            width: '50%',
          },
        ],
        margin: [0, 0, 0, 12],
      });
    }

    return this.generarPDF(contenido, 'expedientes', res);
  }

  // ============================
  // REPORTE EXPEDIENTE EMPLEADO
  // ============================

  async generarReporteExpedienteEmpleado(id: number, res: any) {
    const tiposDocumentos = await this.prisma.tipoDocumento.findMany({
      where: { eliminado: { not: true } },
    });

    const emp = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: {
        validacion: true,
        documentos: {
          where: { eliminado: { not: true } },
          include: { tipo: true },
        },
      },
    });

    if (!emp) {
      throw new NotFoundException(`El empleado con ID ${id} no existe`);
    }

    const idsSubidos = emp.documentos.map((d) => d.id_tipo);
    const faltantes = tiposDocumentos.filter(
      (t) => !idsSubidos.includes(t.id_tipo),
    );

    const porcentaje = tiposDocumentos.length > 0
      ? Math.round((emp.documentos.length / tiposDocumentos.length) * 100)
      : 100;

    const contenido: any[] = [
      ...this.headerBlock(
        'EXPEDIENTE DE EMPLEADO',
        `${emp.nombre_empleado} ${emp.apellido_empleado}`,
      ),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            this.filaInfo('DPI', emp.dpi),
            this.filaInfo('Correo', emp.correo),
            this.filaInfo('Teléfono', emp.telefono),
            this.filaInfo('Dirección', emp.direccion),
          ],
          width: '60%',
        },
        {
          stack: [
            { text: 'Estado Expediente', style: 'label', margin: [0, 2, 0, 4] },
            this.badgeEstado(emp.validacion?.estado || 'SIN VALIDAR'),
            { text: ' ', margin: [0, 4] },
            { text: 'Completado', style: 'label', margin: [0, 2, 0, 2] },
            {
              text: `${porcentaje}%`,
              fontSize: 20,
              bold: true,
              color: porcentaje === 100 ? COLOR_SUCCESS : COLOR_WARNING,
              alignment: 'right',
            },
          ],
          width: '40%',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 16],
    });

    contenido.push(this.seccionBlock('DOCUMENTOS SUBIDOS'));

    if (emp.documentos.length === 0) {
      contenido.push({
        text: 'No se han subido documentos.',
        italics: true,
        color: COLOR_MUTED,
        fontSize: 9,
        margin: [0, 4, 0, 8],
      });
    } else {
      contenido.push(
        this.tablaConceptos([
          ['#', 'Documento', 'Fecha de carga'],
          ...emp.documentos.map((doc, i) => [
            String(i + 1),
            doc.tipo.nombre,
            new Date(doc.fecha_carga).toLocaleDateString('es-GT'),
          ]),
        ]),
      );
    }

    contenido.push(this.seccionBlock('DOCUMENTOS FALTANTES'));

    if (faltantes.length === 0) {
      contenido.push({
        text: '✔  El expediente está completo. No hay documentos faltantes.',
        color: COLOR_SUCCESS,
        bold: true,
        fontSize: 10,
        margin: [0, 4, 0, 8],
      });
    } else {
      contenido.push(
        this.tablaConceptos([
          ['#', 'Documento', 'Obligatorio'],
          ...faltantes.map((f, i) => [
            String(i + 1),
            f.nombre,
            f.obligatorio ? 'Sí' : 'No',
          ]),
        ]),
      );
    }

    return this.generarPDF(contenido, `expediente_${id}`, res);
  }

  // ============================
  // HELPER ACADÉMICO: tarjeta de información académica
  // ============================

  private tarjetaInfoAcademica(acad: any, index: number): any {
    return {
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            {
              columns: [
                {
                  text: String(index + 1),
                  fontSize: 20,
                  bold: true,
                  color: COLOR_SECONDARY,
                  width: 24,
                  margin: [0, 2, 8, 0],
                },
                {
                  stack: [
                    { text: acad.titulo, bold: true, fontSize: 11, color: COLOR_PRIMARY, margin: [0, 0, 0, 4] },
                    this.filaInfo('Institución', acad.institucion),
                    this.filaInfo('Certificación', acad.certificacion),
                    this.filaInfo(
                      'Fecha de graduación',
                      new Date(acad.fecha_graduacion).toLocaleDateString('es-GT'),
                    ),
                  ],
                },
              ],
            },
          ],
          margin: [8, 8, 8, 8],
          fillColor: COLOR_ACCENT,
        }]],
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      margin: [0, 0, 0, 6],
    };
  }

  // ============================
  // HELPER ACADÉMICO: sección global de documentos del empleado
  // ============================

  private seccionDocumentosAcademicos(
    todosLosDocumentos: any[],
    tiposDoc: any[],
  ): any[] {

    const idsSubidos = [...new Set(todosLosDocumentos.map((d: any) => d.id_tipo_doc_academico))];
    const faltantes = tiposDoc.filter((t) => !idsSubidos.includes(t.id_tipo_doc_academico));

    const subidosUnicos = idsSubidos.map((id) => {
      const doc = todosLosDocumentos.find((d: any) => d.id_tipo_doc_academico === id);
      return doc;
    }).filter(Boolean);

    return [
      this.seccionBlock('DOCUMENTOS ACADÉMICOS'),
      {
        columns: [
          {
            stack: [
              {
                text: `✔  Subidos (${subidosUnicos.length} / ${tiposDoc.length})`,
                fontSize: 9,
                bold: true,
                color: COLOR_SUCCESS,
                margin: [0, 0, 0, 4],
              },
              ...(subidosUnicos.length === 0
                ? [{ text: 'Sin documentos subidos', fontSize: 9, color: COLOR_MUTED, italics: true }]
                : subidosUnicos.map((doc: any) => ({
                    text: `· ${doc.tipo_doc.nombre}`,
                    fontSize: 9,
                    color: COLOR_TEXT,
                    margin: [4, 2],
                  }))),
            ],
            width: '50%',
          },
          {
            stack: [
              {
                text: `✘  Faltantes (${faltantes.length})`,
                fontSize: 9,
                bold: true,
                color: faltantes.length === 0 ? COLOR_MUTED : COLOR_WARNING,
                margin: [0, 0, 0, 4],
              },
              ...(faltantes.length === 0
                ? [{ text: 'Expediente académico completo', fontSize: 9, color: COLOR_MUTED, italics: true }]
                : faltantes.map((f: any) => ({
                    text: `· ${f.nombre}${f.obligatorio ? ' *' : ''}`,
                    fontSize: 9,
                    color: COLOR_WARNING,
                    margin: [4, 2],
                  }))),
              ...(faltantes.some((f: any) => f.obligatorio)
                ? [{ text: '* obligatorio', fontSize: 7, color: COLOR_MUTED, italics: true, margin: [4, 4, 0, 0] }]
                : []),
            ],
            width: '50%',
          },
        ],
        margin: [0, 4, 0, 12],
      },
    ];
  }

  // ============================
  // REPORTE GENERAL ACADÉMICO
  // ============================

  async generarReporteAcademicos(res: any) {
    const tiposDoc = await this.prisma.tipoDocumentoAcademico.findMany({
      where: { eliminado: { not: true } },
    });

    const empleados = await this.prisma.empleado.findMany({
      where: { eliminado: { not: true } },
      include: {
        academicos: {
          where: { eliminado: { not: true } },
          include: {
            documentos: {
              where: { eliminado: { not: true } },
              include: { tipo_doc: true },
            },
          },
        },
      },
    });

    const contenido: any[] = [
      ...this.headerBlock('REPORTE DE INFORMACIÓN ACADÉMICA', `${empleados.length} empleados`),
    ];

    const filasResumen: any[][] = [
      ['Empleado', 'Inf. Académica', 'Docs. Subidos', 'Docs. Faltantes'],
      ...empleados.map((emp) => {
        const todosLosDocs = emp.academicos.flatMap((a) => a.documentos);
        const idsSubidos = [...new Set(todosLosDocs.map((d) => d.id_tipo_doc_academico))];
        const faltantes = tiposDoc.filter((t) => !idsSubidos.includes(t.id_tipo_doc_academico));
        return [
          `${emp.nombre_empleado} ${emp.apellido_empleado}`,
          String(emp.academicos.length),
          String(idsSubidos.length),
          String(faltantes.length),
        ];
      }),
    ];

    contenido.push({ text: 'Resumen General', style: 'subheader' });
    contenido.push(this.tablaConceptos(filasResumen));

    for (const emp of empleados) {
      if (emp.academicos.length === 0) continue;

      contenido.push(
        this.seccionBlock(`${emp.nombre_empleado} ${emp.apellido_empleado}`),
      );

      for (let i = 0; i < emp.academicos.length; i++) {
        contenido.push(this.tarjetaInfoAcademica(emp.academicos[i], i));
      }

      const todosLosDocs = emp.academicos.flatMap((a) => a.documentos);
      contenido.push(...this.seccionDocumentosAcademicos(todosLosDocs, tiposDoc));
    }

    return this.generarPDF(contenido, 'academicos', res);
  }

  // ============================
  // REPORTE ACADÉMICO EMPLEADO
  // ============================

  async generarReporteAcademicoEmpleado(id: number, res: any) {
    const tiposDoc = await this.prisma.tipoDocumentoAcademico.findMany({
      where: { eliminado: { not: true } },
    });

    const emp = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: {
        academicos: {
          where: { eliminado: { not: true } },
          include: {
            documentos: {
              where: { eliminado: { not: true } },
              include: { tipo_doc: true },
            },
          },
        },
      },
    });

    if (!emp) {
      throw new NotFoundException(`El empleado con ID ${id} no existe`);
    }

    const todosLosDocsEmp = emp.academicos.flatMap((a) => a.documentos);
    const idsSubidosEmp = [...new Set(todosLosDocsEmp.map((d) => d.id_tipo_doc_academico))];
    const totalSubidos = idsSubidosEmp.length;
    const totalFaltantes = tiposDoc.filter((t) => !idsSubidosEmp.includes(t.id_tipo_doc_academico)).length;

    const contenido: any[] = [
      ...this.headerBlock(
        'INFORMACIÓN ACADÉMICA',
        `${emp.nombre_empleado} ${emp.apellido_empleado}`,
      ),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            this.filaInfo('Correo', emp.correo),
            this.filaInfo('Teléfono', emp.telefono),
            this.filaInfo('Dirección', emp.direccion),
          ],
          width: '55%',
        },
        {
          table: {
            widths: ['*', '*', '*'],
            body: [
              [
                { text: 'Inf. Académica', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
                { text: 'Docs. Subidos', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
                { text: 'Docs. Faltantes', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
              ],
              [
                { text: String(emp.academicos.length), fontSize: 18, bold: true, color: COLOR_PRIMARY, alignment: 'center' },
                { text: String(totalSubidos), fontSize: 18, bold: true, color: COLOR_SUCCESS, alignment: 'center' },
                { text: String(totalFaltantes), fontSize: 18, bold: true, color: totalFaltantes > 0 ? COLOR_WARNING : COLOR_MUTED, alignment: 'center' },
              ],
            ],
          },
          layout: 'noBorders',
          width: '45%',
        },
      ],
      margin: [0, 0, 0, 12],
    });

    if (emp.academicos.length === 0) {
      contenido.push({
        text: 'Este empleado no tiene información académica registrada.',
        italics: true,
        color: COLOR_MUTED,
        margin: [0, 8],
      });
      return this.generarPDF(contenido, `academico_${id}`, res);
    }

    contenido.push(this.seccionBlock('INFORMACIÓN ACADÉMICA'));
    for (let i = 0; i < emp.academicos.length; i++) {
      contenido.push(this.tarjetaInfoAcademica(emp.academicos[i], i));
    }

    contenido.push(
      ...this.seccionDocumentosAcademicos(todosLosDocsEmp, tiposDoc),
    );

    return this.generarPDF(contenido, `academico_${id}`, res);
  }

  // ============================
  // REPORTE NÓMINAS POR EMPLEADO (historial)
  // ============================

  async generarReporteNominasPorEmpleado(id: number, res: any) {
    const emp = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
    });

    if (!emp) {
      throw new NotFoundException(`El empleado con ID ${id} no existe`);
    }

    const detalles = await this.prisma.detalleNomina.findMany({
      where: { id_empleado: id, eliminado: { not: true } },
      include: {
        nomina: true,
        conceptos: {
          where: { eliminado: { not: true } },
          include: { concepto: true },
        },
      },
      orderBy: { nomina: { fecha_creacion: 'desc' } },
    });

    const totalAcumulado = detalles.reduce(
      (acc, d) => acc + Number(d.total_liquido ?? 0),
      0,
    );

    const contenido: any[] = [
      ...this.headerBlock(
        'HISTORIAL DE NÓMINAS',
        `${emp.nombre_empleado} ${emp.apellido_empleado}`,
      ),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            this.filaInfo('Correo', emp.correo),
            this.filaInfo('Teléfono', emp.telefono),
          ],
          width: '55%',
        },
        {
          table: {
            widths: ['*', '*'],
            body: [
              [
                { text: 'Nóminas Participadas', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
                { text: 'Total Acumulado', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
              ],
              [
                { text: String(detalles.length), fontSize: 18, bold: true, color: COLOR_PRIMARY, alignment: 'center' },
                { text: `Q${totalAcumulado.toFixed(2)}`, fontSize: 14, bold: true, color: COLOR_SUCCESS, alignment: 'center' },
              ],
            ],
          },
          layout: 'noBorders',
          width: '45%',
        },
      ],
      margin: [0, 0, 0, 12],
    });

    if (detalles.length === 0) {
      contenido.push({
        text: 'Este empleado no ha participado en ninguna nómina.',
        italics: true,
        color: COLOR_MUTED,
        margin: [0, 8],
      });
      return this.generarPDF(contenido, `nominas_empleado_${id}`, res);
    }

    contenido.push({ text: 'Resumen por Nómina', style: 'subheader' });
    contenido.push(
      this.tablaConceptos([
        ['Nómina #', 'Periodo', 'Tipo', 'Estado', 'Salario Base', 'H. Extra', 'Total Líquido'],
        ...detalles.map((d) => [
          String(d.nomina.id_nomina),
          d.nomina.periodo,
          d.nomina.tipo,
          d.nomina.estado,
          `Q${Number(d.salario_base).toFixed(2)}`,
          String(d.horas_extra),
          `Q${Number(d.total_liquido ?? 0).toFixed(2)}`,
        ]),
      ]),
    );

    contenido.push(this.seccionBlock('DETALLE DE CONCEPTOS POR NÓMINA'));

    for (const d of detalles) {
      contenido.push({
        text: `Nómina #${d.nomina.id_nomina} — ${d.nomina.periodo}`,
        bold: true,
        fontSize: 10,
        color: COLOR_PRIMARY,
        margin: [0, 8, 0, 2],
      });

      if (d.conceptos.length === 0) {
        contenido.push({
          text: 'Sin conceptos registrados en esta nómina.',
          fontSize: 9,
          color: COLOR_MUTED,
          italics: true,
          margin: [0, 0, 0, 6],
        });
        continue;
      }

      contenido.push(
        this.tablaConceptos([
          ['Concepto', 'Tipo', 'Monto'],
          ...d.conceptos.map((c) => [
            c.concepto.nombre,
            c.concepto.tipo,
            `Q${Number(c.monto).toFixed(2)}`,
          ]),
        ]),
      );
    }

    return this.generarPDF(contenido, `nominas_empleado_${id}`, res);
  }

  // ============================
  // REPORTE DETALLE EMPLEADO EN NÓMINA ESPECÍFICA
  // ============================

  async generarReporteDetalleEmpleadoEnNomina(
    nominaId: number,
    empleadoId: number,
    res: any,
  ) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina: nominaId },
    });

    if (!nomina) {
      throw new NotFoundException(`La nómina con ID ${nominaId} no existe`);
    }

    const detalle = await this.prisma.detalleNomina.findFirst({
      where: { id_nomina: nominaId, id_empleado: empleadoId, eliminado: { not: true } },
      include: {
        empleado: true,
        conceptos: {
          include: { concepto: true },
        },
      },
    });

    if (!detalle) {
      throw new NotFoundException(
        `El empleado con ID ${empleadoId} no tiene detalle en la nómina ${nominaId}`,
      );
    }

    const conceptosActivos = detalle.conceptos.filter((c) => c.eliminado !== true);

    const contenido: any[] = [
      ...this.headerBlock(
        'DETALLE DE NÓMINA',
        `${detalle.empleado.nombre_empleado} ${detalle.empleado.apellido_empleado}  ·  Nómina #${nominaId}`,
      ),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            { text: 'DATOS DE LA NÓMINA', fontSize: 8, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 4] },
            this.filaInfo('Nómina #', String(nomina.id_nomina)),
            this.filaInfo('Periodo', nomina.periodo),
            this.filaInfo('Tipo', nomina.tipo),
            this.filaInfo('Fecha', new Date(nomina.fecha_creacion).toLocaleDateString('es-GT')),
          ],
          width: '45%',
        },
        {
          stack: [
            { text: 'DATOS DEL EMPLEADO', fontSize: 8, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 4] },
            this.filaInfo('Correo', detalle.empleado.correo),
            this.filaInfo('Teléfono', detalle.empleado.telefono),
            this.filaInfo('Dirección', detalle.empleado.direccion),
            this.filaInfo('Estado', detalle.empleado.estado),
          ],
          width: '45%',
        },
        {
          stack: [
            { text: 'ESTADO', fontSize: 8, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 6] },
            this.badgeEstado(nomina.estado),
          ],
          width: '10%',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 12],
    });

    contenido.push(this.seccionBlock('CÁLCULO DE HABERES'));

    contenido.push(
      this.tablaConceptos([
        ['Concepto', 'Valor'],
        ['Salario Base', `Q${Number(detalle.salario_base).toFixed(2)}`],
        ['Horas Trabajadas', String(detalle.horas_trabajadas)],
        ['Horas Extra', String(detalle.horas_extra)],
        ['Pago Horas Normales', detalle.pago_horas_normales != null ? `Q${Number(detalle.pago_horas_normales).toFixed(2)}` : '—'],
        ['Pago Horas Extra', detalle.pago_horas_extra != null ? `Q${Number(detalle.pago_horas_extra).toFixed(2)}` : '—'],
      ]),
    );

    contenido.push(this.seccionBlock('CONCEPTOS APLICADOS'));

    if (conceptosActivos.length === 0) {
      contenido.push({
        text: 'No hay conceptos registrados en este detalle de nómina.',
        italics: true,
        color: COLOR_MUTED,
        fontSize: 9,
        margin: [0, 4, 0, 8],
      });
    } else {

      const TIPOS_INGRESO = ['Bonificacion', 'Comision'];
      const TIPOS_DEDUCCION = ['Deduccion', 'Descuento'];

      const ingresos = conceptosActivos.filter((c) =>
        TIPOS_INGRESO.includes(c.concepto.tipo),
      );
      const deducciones = conceptosActivos.filter((c) =>
        TIPOS_DEDUCCION.includes(c.concepto.tipo),
      );
      const otros = conceptosActivos.filter(
        (c) =>
          !TIPOS_INGRESO.includes(c.concepto.tipo) &&
          !TIPOS_DEDUCCION.includes(c.concepto.tipo),
      );

      const subtotalIngresos = ingresos.reduce((acc, c) => acc + Number(c.monto), 0);
      const subtotalDeducciones = deducciones.reduce((acc, c) => acc + Number(c.monto), 0);

      if (ingresos.length > 0) {
        contenido.push({
          text: '▲  Ingresos (Bonificaciones y Comisiones)',
          bold: true,
          fontSize: 9,
          color: COLOR_SUCCESS,
          margin: [0, 6, 0, 2],
        });
        contenido.push(
          this.tablaConceptos([
            ['Concepto', 'Tipo', 'Monto'],
            ...ingresos.map((c) => [
              c.concepto.nombre,
              c.concepto.tipo,
              `Q${Number(c.monto).toFixed(2)}`,
            ]),
            ['', 'Subtotal', `Q${subtotalIngresos.toFixed(2)}`],
          ]),
        );
      }

      if (deducciones.length > 0) {
        contenido.push({
          text: '▼  Deducciones y Descuentos',
          bold: true,
          fontSize: 9,
          color: COLOR_WARNING,
          margin: [0, 6, 0, 2],
        });
        contenido.push(
          this.tablaConceptos([
            ['Concepto', 'Tipo', 'Monto'],
            ...deducciones.map((c) => [
              c.concepto.nombre,
              c.concepto.tipo,
              `Q${Number(c.monto).toFixed(2)}`,
            ]),
            ['', 'Subtotal', `Q${subtotalDeducciones.toFixed(2)}`],
          ]),
        );
      }

      if (otros.length > 0) {
        contenido.push({
          text: '●  Otros Conceptos',
          bold: true,
          fontSize: 9,
          color: COLOR_MUTED,
          margin: [0, 6, 0, 2],
        });
        contenido.push(
          this.tablaConceptos([
            ['Concepto', 'Tipo', 'Monto'],
            ...otros.map((c) => [
              c.concepto.nombre,
              c.concepto.tipo,
              `Q${Number(c.monto).toFixed(2)}`,
            ]),
          ]),
        );
      }
    }

    contenido.push({
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'TOTAL LÍQUIDO A RECIBIR', bold: true, fontSize: 12, color: COLOR_WHITE, margin: [8, 10] },
            {
              text: `Q${Number(detalle.total_liquido ?? 0).toFixed(2)}`,
              bold: true,
              fontSize: 16,
              color: COLOR_WHITE,
              alignment: 'right',
              margin: [8, 8],
            },
          ],
        ],
      },
      layout: 'noBorders',
      fillColor: COLOR_PRIMARY,
      margin: [0, 12, 0, 8],
    });

    return this.generarPDF(
      contenido,
      `nomina_${nominaId}_empleado_${empleadoId}`,
      res,
    );
  }
}