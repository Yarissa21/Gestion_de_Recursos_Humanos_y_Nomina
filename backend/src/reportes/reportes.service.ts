import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

const PdfPrinter = require('pdfmake/src/printer');

// ============================
// PALETA CORPORATIVA
// ============================
const COLOR_PRIMARY    = '#1E3A5F'; 
const COLOR_SECONDARY  = '#2E86AB'; 
const COLOR_ACCENT     = '#F0F4F8'; 
const COLOR_WHITE      = '#FFFFFF';
const COLOR_TEXT       = '#2D3748';
const COLOR_MUTED      = '#718096';
const COLOR_SUCCESS    = '#276749'; 
const COLOR_WARNING    = '#744210'; 
const COLOR_SUCCESS_BG = '#F0FFF4';
const COLOR_WARNING_BG = '#FFFBEB';
const COLOR_INGRESO_BG   = '#C6F6D5';
const COLOR_DEDUCCION_BG = '#FED7D7';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService, private validacionService: ValidacionExpedienteService,) {}

  private fonts = {
    Roboto: {
      normal:      'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
      bold:        'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
      italics:     'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
      bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf',
    },
  };

  // ============================
  // HELPERS DE DISEÑO
  // ============================

  private headerBlock(titulo: string, subtitulo?: string): any[] {
    return [
      {
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'SISTEMA DE GESTIÓN DE RRHH', fontSize: 9, color: COLOR_SECONDARY, bold: true, letterSpacing: 1 },
              { text: titulo, fontSize: 20, bold: true, color: COLOR_WHITE, margin: [0, 4, 0, 2] },
              ...(subtitulo ? [{ text: subtitulo, fontSize: 11, color: '#A8C8E8', italics: true }] : []),
            ],
            fillColor: COLOR_PRIMARY,
            margin: [20, 16, 20, 16],
          }]],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 12],
      },
    ];
  }

  private seccionBlock(texto: string): any {
    return {
      table: {
        widths: ['*'],
        body: [[{ text: texto, bold: true, fontSize: 9, color: COLOR_WHITE, margin: [8, 4] }]],
      },
      layout: 'noBorders',
      fillColor: COLOR_PRIMARY,
      margin: [0, 6, 0, 4],
    };
  }

  private seccionBlockSub(texto: string): any {
    return {
      table: {
        widths: ['*'],
        body: [[{ text: texto, bold: true, fontSize: 8, color: COLOR_WHITE, margin: [8, 3] }]],
      },
      layout: 'noBorders',
      fillColor: COLOR_SECONDARY,
      margin: [0, 4, 0, 3],
    };
  }

  private filaInfo(clave: string, valor: string): any {
    return {
      columns: [
        { text: clave, bold: true, fontSize: 9, color: COLOR_MUTED, width: 130 },
        { text: valor || '—', fontSize: 9, color: COLOR_TEXT },
      ],
      margin: [0, 2, 0, 2],
    };
  }

  // Fila compacta para tablas de datos densos
  private filaInfoCompacta(clave: string, valor: string, anchoLabel = 100): any {
    return {
      columns: [
        { text: `${clave}:`, bold: true, fontSize: 8, color: COLOR_TEXT, width: anchoLabel },
        { text: valor || '—', fontSize: 8, color: COLOR_TEXT },
      ],
      margin: [0, 1, 0, 1],
    };
  }

  private badgeEstado(estado: string): any {
    const estadoUpper = (estado || '').toUpperCase();
    let bg = '#E2E8F0', fg = COLOR_TEXT;
    if (['PROCESADA', 'ACTIVO', 'APROBADO', 'COMPLETO'].includes(estadoUpper)) { bg = COLOR_SUCCESS_BG; fg = COLOR_SUCCESS; }
    else if (['PENDIENTE', 'SIN VALIDAR'].includes(estadoUpper)) { bg = COLOR_WARNING_BG; fg = COLOR_WARNING; }
    else if (['CERRADA', 'RETIRADO', 'SUSPENDIDO'].includes(estadoUpper)) { bg = '#FFF5F5'; fg = '#742A2A'; }
    return {
      table: { body: [[{ text: estado || 'SIN VALIDAR', fontSize: 7, bold: true, color: fg, margin: [5, 2] }]] },
      layout: 'noBorders',
      fillColor: bg,
    };
  }

  private tablaConceptos(filas: any[][]): any {
    if (!filas.length) return { text: '' };
    const header = filas[0].map((celda) => ({
      text: String(celda), bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, margin: [5, 4],
    }));
    const cuerpo = filas.slice(1).map((fila, i) =>
      fila.map((celda) => ({
        text: String(celda ?? '—'), fontSize: 8, color: COLOR_TEXT,
        fillColor: i % 2 === 0 ? COLOR_WHITE : COLOR_ACCENT, margin: [5, 3],
      })),
    );
    return {
      table: { headerRows: 1, widths: Array(filas[0].length).fill('*'), body: [header, ...cuerpo] },
      layout: { hLineWidth: () => 0.4, vLineWidth: () => 0, hLineColor: () => '#CBD5E0' },
      margin: [0, 2, 0, 6],
    };
  }

  private footerFn() {
    return (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Generado el ${new Date().toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}`, fontSize: 7, color: COLOR_MUTED, margin: [20, 0] },
        { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', fontSize: 7, color: COLOR_MUTED, margin: [0, 0, 20, 0] },
      ],
      margin: [0, 4],
    });
  }

  // ============================
  // CREAR PDF
  // ============================

  private generarPDF(contenido: any[], titulo: string, res: any, landscape = false) {
    const docDefinition: any = {
      pageSize: 'LETTER',
      pageOrientation: landscape ? 'landscape' : 'portrait',
      pageMargins: [30, 30, 30, 40],
      content: contenido,
      footer: this.footerFn(),
      defaultStyle: { font: 'Roboto', fontSize: 10, color: COLOR_TEXT },
      styles: {
        header:    { fontSize: 20, bold: true, color: COLOR_WHITE },
        subheader: { fontSize: 12, bold: true, color: COLOR_PRIMARY, margin: [0, 6, 0, 3] },
        label:     { fontSize: 8, bold: true, color: COLOR_MUTED },
        value:     { fontSize: 8, color: COLOR_TEXT },
        monto:     { fontSize: 8, bold: true, color: COLOR_SUCCESS, alignment: 'right' },
      },
    };
    const printer = new PdfPrinter(this.fonts);
    const pdfDoc  = printer.createPdfKitDocument(docDefinition);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${titulo}.pdf`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  }

  // ============================
  // HELPER: tabla SAT con anchos dinámicos
  // ============================

  private tablaSAT(detalles: any[]): any {
    const TIPOS_INGRESO   = ['Bonificacion', 'Comision'];
    const TIPOS_DEDUCCION = ['Deduccion', 'Descuento'];

    const mapaConceptos = new Map<number, { nombre: string; tipo: string }>();
    for (const d of detalles) {
      for (const c of d.conceptos ?? []) {
        if (c.eliminado) continue;
        if (!mapaConceptos.has(c.concepto.id_concepto))
          mapaConceptos.set(c.concepto.id_concepto, { nombre: c.concepto.nombre, tipo: c.concepto.tipo });
      }
    }

    const conceptosIngreso   = [...mapaConceptos.entries()].filter(([, v]) => TIPOS_INGRESO.includes(v.tipo));
    const conceptosDeduccion = [...mapaConceptos.entries()].filter(([, v]) => TIPOS_DEDUCCION.includes(v.tipo));
    const conceptosOtros     = [...mapaConceptos.entries()].filter(([, v]) => !TIPOS_INGRESO.includes(v.tipo) && !TIPOS_DEDUCCION.includes(v.tipo));
    const todosConceptos     = [...conceptosIngreso, ...conceptosOtros, ...conceptosDeduccion];

    const anchoConcepto = todosConceptos.length <= 4 ? '*' : 'auto';
    const widths: any[] = ['auto', 'auto', '*', '*', 'auto', ...todosConceptos.map(() => anchoConcepto), 'auto'];

    const hFila1: any[] = [
      { text: 'No.',             bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 },
      { text: 'NIT',             bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 },
      { text: 'Nombre',          bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 },
      { text: 'Puesto/Servicio', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 },
      { text: 'Salario\nBase',   bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 },
    ];
    if (conceptosIngreso.length > 0) {
      hFila1.push({ text: 'INGRESOS', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: '#276749', alignment: 'center', margin: [3, 5], colSpan: conceptosIngreso.length });
      for (let i = 1; i < conceptosIngreso.length; i++) hFila1.push({});
    }
    if (conceptosOtros.length > 0) {
      hFila1.push({ text: 'OTROS', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_SECONDARY, alignment: 'center', margin: [3, 5], colSpan: conceptosOtros.length });
      for (let i = 1; i < conceptosOtros.length; i++) hFila1.push({});
    }
    if (conceptosDeduccion.length > 0) {
      hFila1.push({ text: 'DEDUCCIONES', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: '#742A2A', alignment: 'center', margin: [3, 5], colSpan: conceptosDeduccion.length });
      for (let i = 1; i < conceptosDeduccion.length; i++) hFila1.push({});
    }
    hFila1.push({ text: 'Salario\nDevengado', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'center', margin: [3, 5], rowSpan: 2 });

    const hFila2: any[] = [{}, {}, {}, {}, {}];
    for (const [, c] of conceptosIngreso)   hFila2.push({ text: c.nombre, bold: true, fontSize: 6, color: COLOR_WHITE, fillColor: '#276749',     alignment: 'center', margin: [3, 3] });
    for (const [, c] of conceptosOtros)     hFila2.push({ text: c.nombre, bold: true, fontSize: 6, color: COLOR_WHITE, fillColor: COLOR_SECONDARY, alignment: 'center', margin: [3, 3] });
    for (const [, c] of conceptosDeduccion) hFila2.push({ text: c.nombre, bold: true, fontSize: 6, color: COLOR_WHITE, fillColor: '#742A2A',     alignment: 'center', margin: [3, 3] });
    hFila2.push({});

    const filasDatos = detalles.map((d, idx) => {
      const mapaMontos = new Map<number, number>();
      for (const c of d.conceptos ?? []) if (!c.eliminado) mapaMontos.set(c.concepto.id_concepto, Number(c.monto));
      const bg = idx % 2 === 0 ? COLOR_WHITE : COLOR_ACCENT;
      const fila: any[] = [
        { text: String(idx + 1),                                                 fontSize: 7, color: COLOR_TEXT, alignment: 'center', fillColor: bg, margin: [3, 4] },
        { text: d.empleado.dpi ?? '—',                                           fontSize: 7, color: COLOR_TEXT, fillColor: bg, margin: [3, 4] },
        { text: `${d.empleado.nombre_empleado} ${d.empleado.apellido_empleado}`, fontSize: 7, color: COLOR_TEXT, fillColor: bg, margin: [3, 4] },
        { text: d.empleado.puesto?.nombre_puesto ?? '—',                         fontSize: 7, color: COLOR_TEXT, fillColor: bg, margin: [3, 4] },
        { text: `Q${Number(d.salario_base).toFixed(2)}`,                         fontSize: 7, color: COLOR_TEXT, alignment: 'right', fillColor: bg, margin: [3, 4] },
      ];
      for (const [id] of conceptosIngreso)   fila.push({ text: mapaMontos.has(id) ? `Q${mapaMontos.get(id)!.toFixed(2)}` : '0.00', fontSize: 7, color: COLOR_TEXT, alignment: 'right', fillColor: idx % 2 === 0 ? '#F0FFF4' : '#E6FFF0', margin: [3, 4] });
      for (const [id] of conceptosOtros)     fila.push({ text: mapaMontos.has(id) ? `Q${mapaMontos.get(id)!.toFixed(2)}` : '0.00', fontSize: 7, color: COLOR_TEXT, alignment: 'right', fillColor: bg, margin: [3, 4] });
      for (const [id] of conceptosDeduccion) fila.push({ text: mapaMontos.has(id) ? `Q${mapaMontos.get(id)!.toFixed(2)}` : '0.00', fontSize: 7, color: COLOR_TEXT, alignment: 'right', fillColor: idx % 2 === 0 ? '#FFF5F5' : '#FFF0F0', margin: [3, 4] });
      fila.push({ text: `Q${Number(d.total_liquido ?? 0).toFixed(2)}`, fontSize: 7, bold: true, color: COLOR_TEXT, alignment: 'right', fillColor: bg, margin: [3, 4] });
      return fila;
    });

    const totalGeneral = detalles.reduce((acc, d) => acc + Number(d.total_liquido ?? 0), 0);
    const filaTotales: any[] = [
      { text: 'TOTALES', bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, colSpan: 5, alignment: 'right', margin: [4, 5] },
      {}, {}, {}, {},
    ];
    for (const [id, c] of todosConceptos) {
      const total = detalles.reduce((acc, d) => {
        const found = (d.conceptos ?? []).find((x: any) => !x.eliminado && x.concepto.id_concepto === id);
        return acc + (found ? Number(found.monto) : 0);
      }, 0);
      filaTotales.push({ text: `Q${total.toFixed(2)}`, bold: true, fontSize: 7, alignment: 'right', margin: [3, 5], color: COLOR_TEXT, fillColor: ['Deduccion','Descuento'].includes(c.tipo) ? COLOR_DEDUCCION_BG : ['Bonificacion','Comision'].includes(c.tipo) ? COLOR_INGRESO_BG : COLOR_ACCENT });
    }
    filaTotales.push({ text: `Q${totalGeneral.toFixed(2)}`, bold: true, fontSize: 7, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'right', margin: [3, 5] });

    return {
      table: { headerRows: 2, widths, body: [hFila1, hFila2, ...filasDatos, filaTotales] },
      layout: { hLineWidth: (i: number) => (i === 0 || i === 2) ? 0 : 0.4, vLineWidth: () => 0.3, hLineColor: () => '#CBD5E0', vLineColor: () => '#CBD5E0' },
      margin: [0, 4, 0, 12],
    };
  }

  // ============================
  // HELPER: baucher estilo documento formal
  // ============================

  private filaInfoBoleta(clave: string, valor: string): any {
    return {
      columns: [
        { text: `${clave}:`, bold: true, fontSize: 8, color: COLOR_TEXT, width: 90 },
        { text: valor || '—', fontSize: 8, color: COLOR_TEXT },
      ],
      margin: [0, 1, 0, 1],
    };
  }

  private baucherPago(detalle: any, nomina: any): any[] {
    const emp = detalle.empleado;
    const TIPOS_INGRESO   = ['Bonificacion', 'Comision'];
    const TIPOS_DEDUCCION = ['Deduccion', 'Descuento'];

    const conceptosActivos = (detalle.conceptos ?? []).filter((c: any) => c.eliminado !== true);
    const ingresos    = conceptosActivos.filter((c: any) => TIPOS_INGRESO.includes(c.concepto.tipo));
    const deducciones = conceptosActivos.filter((c: any) => TIPOS_DEDUCCION.includes(c.concepto.tipo));

    const totalIngresos    = ingresos.reduce((a: number, c: any) => a + Number(c.monto), 0);
    const totalDeducciones = deducciones.reduce((a: number, c: any) => a + Number(c.monto), 0);
    const totalLiquido     = Number(detalle.total_liquido ?? 0);

    const [anio, mes]  = nomina.periodo.split('-');
    const diasMes      = new Date(Number(anio), Number(mes), 0).getDate();
    const periodoTexto = `${anio}-${mes}-01 al ${anio}-${mes}-${String(diasMes).padStart(2, '0')}`;
    const obsTexto     = nomina.tipo === 'Quincenal' ? 'BOLETA QUINCENAL' : 'BOLETA MENSUAL';

    const filasIng: { desc: string; monto: number | null }[] = [
      ...ingresos.map((c: any) => ({ desc: c.concepto.nombre.toUpperCase(), monto: Number(c.monto) })),
      { desc: 'SALARIO ORDINARIO', monto: Number(detalle.salario_base) },
    ];
    const filesDed: { desc: string; monto: number | null }[] = [
      ...deducciones.map((c: any) => ({ desc: c.concepto.nombre.toUpperCase(), monto: Number(c.monto) })),
    ];
    const maxFilas = Math.max(filasIng.length, filesDed.length);
    while (filasIng.length < maxFilas) filasIng.push({ desc: '', monto: null });
    while (filesDed.length < maxFilas) filesDed.push({ desc: '', monto: null });

    const bodyTabla = filasIng.map((fi, i) => {
      const fd = filesDed[i];
      return [
        { text: fi.desc, fontSize: 8, color: COLOR_TEXT, margin: [4, 4] },
        { text: fi.monto != null ? `Q${fi.monto.toFixed(2)}` : '', fontSize: 8, color: COLOR_TEXT, alignment: 'right', margin: [4, 4] },
        { text: fd.desc, fontSize: 8, color: COLOR_TEXT, margin: [4, 4] },
        { text: fd.monto != null ? `Q${fd.monto.toFixed(2)}` : '', fontSize: 8, color: COLOR_TEXT, alignment: 'right', margin: [4, 4] },
      ];
    });

    return [
      { text: 'RECIBO DE PAGO MENSUAL', fontSize: 13, bold: true, alignment: 'center', color: COLOR_TEXT, margin: [0, 0, 0, 2] },
      {
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: 'DATOS DEL EMPLEADO', bold: true, fontSize: 9, alignment: 'center', color: COLOR_TEXT, margin: [0, 0, 0, 6] },
              {
                columns: [
                  {
                    stack: [
                      this.filaInfoBoleta('Código',  String(emp.id_empleado)),
                      this.filaInfoBoleta('Nombre',  `${emp.nombre_empleado} ${emp.apellido_empleado}`),
                      this.filaInfoBoleta('Nit',     emp.dpi ?? '—'),
                      this.filaInfoBoleta('Puesto',  emp.puesto?.nombre_puesto ?? '—'),
                    ],
                    width: '50%',
                  },
                  {
                    stack: [
                      this.filaInfoBoleta('División', emp.departamento?.nombre_departamento ?? '—'),
                      { text: ' ', margin: [0, 3] },
                      { text: `Período de pago: ${periodoTexto}`, fontSize: 8, color: COLOR_TEXT },
                      { text: `Observaciones: ${obsTexto}`, fontSize: 8, color: COLOR_TEXT, margin: [0, 3, 0, 0] },
                    ],
                    width: '50%',
                  },
                ],
              },
            ],
            margin: [8, 8, 8, 8],
          }]],
        },
        layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#A0AEC0', vLineColor: () => '#A0AEC0' },
        margin: [0, 0, 0, 8],
      },
      {
        table: {
          widths: ['*', 80, '*', 80],
          body: [
            [
              { text: 'INGRESOS',   bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, colSpan: 2, alignment: 'center', margin: [4, 5] }, {},
              { text: 'DESCUENTOS', bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, colSpan: 2, alignment: 'center', margin: [4, 5] }, {},
            ],
            [
              { text: 'Descripción', bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, margin: [4, 3] },
              { text: 'Monto',       bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'right', margin: [4, 3] },
              { text: 'Descripción', bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, margin: [4, 3] },
              { text: 'Monto',       bold: true, fontSize: 8, color: COLOR_WHITE, fillColor: COLOR_PRIMARY, alignment: 'right', margin: [4, 3] },
            ],
            ...bodyTabla,
          ],
        },
        layout: { hLineWidth: () => 0.4, vLineWidth: () => 0.4, hLineColor: () => '#A0AEC0', vLineColor: () => '#A0AEC0' },
        margin: [0, 0, 0, 0],
      },
      {
        table: {
          widths: ['*', '*'],
          body: [[
            { text: `Total de Ingresos: Q${(Number(detalle.salario_base) + totalIngresos).toFixed(2)}`, fontSize: 8, bold: true, color: COLOR_TEXT, margin: [4, 5] },
            { text: `Total de Descuentos: Q${totalDeducciones.toFixed(2)}`, fontSize: 8, bold: true, color: COLOR_TEXT, alignment: 'right', margin: [4, 5] },
          ]],
        },
        layout: { hLineWidth: () => 0.4, vLineWidth: () => 0, hLineColor: () => '#A0AEC0' },
        margin: [0, 0, 0, 8],
      },
      { text: `LIQUIDO A RECIBIR: Q${totalLiquido.toFixed(2)}`, fontSize: 10, bold: true, color: COLOR_TEXT, margin: [0, 0, 0, 24] },
      {
        columns: [{
          stack: [
            { text: 'RECIBI CONFORME: (F):', fontSize: 8, color: COLOR_TEXT, margin: [0, 0, 0, 18] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 0.5, lineColor: COLOR_TEXT }] },
            { text: `${emp.nombre_empleado} ${emp.apellido_empleado}`, fontSize: 8, color: COLOR_TEXT, alignment: 'center', width: 160, margin: [0, 2, 0, 0] },
          ],
          width: 200,
        }],
        margin: [0, 0, 0, 0],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#A0AEC0', dash: { length: 4, space: 4 } }],
        margin: [0, 20, 0, 0],
      },
    ];
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
            empleado: { include: { puesto: true, departamento: true } },
            conceptos: { where: { eliminado: { not: true } }, include: { concepto: true } },
          },
        },
      },
    });

    const contenido: any[] = [
      ...this.headerBlock('REPORTE GENERAL DE NÓMINAS', `Total de nóminas: ${nominas.length}`),
    ];

    for (const nomina of nominas) {
      contenido.push(this.seccionBlock(`Nómina #${nomina.id_nomina}  ·  ${nomina.periodo}  ·  Tipo: ${nomina.tipo}  ·  Estado: ${nomina.estado}`));
      if (nomina.detalles.length === 0) {
        contenido.push({ text: 'Esta nómina no tiene detalles registrados.', italics: true, color: COLOR_MUTED, fontSize: 8, margin: [0, 0, 0, 8] });
        continue;
      }
      contenido.push(this.tablaSAT(nomina.detalles));
    }

    return this.generarPDF(contenido, 'nominas', res, true);
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
            empleado: { include: { puesto: true, departamento: true } },
            conceptos: { where: { eliminado: { not: true } }, include: { concepto: true } },
          },
        },
      },
    });

    if (!nomina) throw new NotFoundException(`La nómina con ID ${id} no existe`);

    const totalLiquido = nomina.detalles.reduce((acc, d) => acc + Number(d.total_liquido ?? 0), 0);

    const contenido: any[] = [
      ...this.headerBlock(`NÓMINA #${nomina.id_nomina}`, `Periodo: ${nomina.periodo}  ·  Tipo: ${nomina.tipo}`),
    ];

    contenido.push({
      columns: [
        {
          stack: [
            this.filaInfo('Periodo',   nomina.periodo),
            this.filaInfo('Tipo',      nomina.tipo),
            this.filaInfo('Fecha',     new Date(nomina.fecha_creacion).toLocaleDateString('es-GT')),
            this.filaInfo('Empleados', String(nomina.detalles.length)),
          ],
          width: '60%',
        },
        {
          stack: [
            { text: 'Estado', style: 'label', margin: [0, 2, 0, 4] },
            this.badgeEstado(nomina.estado),
            { text: ' ', margin: [0, 4] },
            { text: 'Total General', style: 'label', margin: [0, 2, 0, 2] },
            { text: `Q${totalLiquido.toFixed(2)}`, fontSize: 16, bold: true, color: COLOR_PRIMARY, alignment: 'right' },
          ],
          width: '40%',
          alignment: 'right',
        },
      ],
      margin: [0, 0, 0, 10],
    });

    if (nomina.detalles.length === 0) {
      contenido.push({ text: 'Esta nómina no tiene detalles registrados.', italics: true, color: COLOR_MUTED, fontSize: 8 });
    } else {
      contenido.push(this.tablaSAT(nomina.detalles));
    }

    return this.generarPDF(contenido, `nomina_${id}`, res, true);
  }

  // ============================
  // REPORTE GENERAL EXPEDIENTES — diseño compacto
  // ============================

  async generarReporteExpedientes(res: any) {
    await this.validacionService.validarTodos();

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
      ...this.headerBlock('REPORTE DE EXPEDIENTES', `${empleados.length} empleados registrados`),
    ];

    // Tabla resumen general compacta
    contenido.push({ text: 'RESUMEN GENERAL', style: 'subheader' });
    contenido.push(this.tablaConceptos([
      ['#', 'Empleado', 'DPI', 'Docs. Subidos', 'Docs. Faltantes', 'Estado'],
      ...empleados.map((emp, i) => {
        const idsSubidos = emp.documentos.map((d) => d.id_tipo);
        const faltantes  = tiposDocumentos.filter((t) => !idsSubidos.includes(t.id_tipo));
        return [
          String(i + 1),
          `${emp.nombre_empleado} ${emp.apellido_empleado}`,
          emp.dpi,
          String(emp.documentos.length),
          String(faltantes.length),
          emp.validacion?.estado || 'SIN VALIDAR',
        ];
      }),
    ]));

    contenido.push(this.seccionBlock('DETALLE POR EMPLEADO'));

    for (const emp of empleados) {
      const idsSubidos = emp.documentos.map((d) => d.id_tipo);
      const faltantes  = tiposDocumentos.filter((t) => !idsSubidos.includes(t.id_tipo));

      contenido.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              {
                columns: [
                  {
                    stack: [
                      { text: `${emp.nombre_empleado} ${emp.apellido_empleado}`, bold: true, fontSize: 10, color: COLOR_PRIMARY, margin: [0, 0, 0, 3] },
                      this.filaInfoCompacta('DPI',       emp.dpi),
                      this.filaInfoCompacta('Correo',    emp.correo),
                      this.filaInfoCompacta('Teléfono',  emp.telefono),
                      this.filaInfoCompacta('Dirección', emp.direccion),
                    ],
                    width: '65%',
                  },
                  {
                    stack: [
                      { text: 'Estado', fontSize: 7, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 2] },
                      this.badgeEstado(emp.validacion?.estado || 'SIN VALIDAR'),
                      { text: ' ', margin: [0, 4] },
                      {
                        table: {
                          widths: ['*', '*'],
                          body: [
                            [
                              { text: 'Subidos',   fontSize: 7, bold: true, color: COLOR_MUTED, alignment: 'center' },
                              { text: 'Faltantes', fontSize: 7, bold: true, color: COLOR_MUTED, alignment: 'center' },
                            ],
                            [
                              { text: String(emp.documentos.length), fontSize: 14, bold: true, color: COLOR_SUCCESS, alignment: 'center' },
                              { text: String(faltantes.length), fontSize: 14, bold: true, color: faltantes.length > 0 ? COLOR_WARNING : COLOR_MUTED, alignment: 'center' },
                            ],
                          ],
                        },
                        layout: 'noBorders',
                      },
                    ],
                    width: '35%',
                    alignment: 'right',
                  },
                ],
                margin: [0, 0, 0, 6],
              },
              {
                columns: [
                  {
                    stack: [
                      { text: `✔  Documentos Subidos (${emp.documentos.length})`, fontSize: 8, bold: true, color: COLOR_SUCCESS, margin: [0, 0, 0, 2] },
                      ...(emp.documentos.length === 0
                        ? [{ text: 'Sin documentos', fontSize: 7, color: COLOR_MUTED, italics: true, margin: [6, 1] }]
                        : emp.documentos.map((doc) => ({ text: `· ${doc.tipo.nombre}`, fontSize: 7, color: COLOR_TEXT, margin: [6, 1] }))),
                    ],
                    width: '50%',
                  },
                  {
                    stack: [
                      { text: `✘  Documentos Faltantes (${faltantes.length})`, fontSize: 8, bold: true, color: faltantes.length === 0 ? COLOR_MUTED : COLOR_WARNING, margin: [0, 0, 0, 2] },
                      ...(faltantes.length === 0
                        ? [{ text: 'Expediente completo', fontSize: 7, color: COLOR_MUTED, italics: true, margin: [6, 1] }]
                        : faltantes.map((f) => ({ text: `· ${f.nombre}`, fontSize: 7, color: COLOR_WARNING, margin: [6, 1] }))),
                    ],
                    width: '50%',
                  },
                ],
              },
            ],
            margin: [8, 8, 8, 8],
            fillColor: COLOR_WHITE,
          }]],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#CBD5E0',
          vLineColor: () => '#CBD5E0',
        },
        margin: [0, 0, 0, 6],
      });
    }

    return this.generarPDF(contenido, 'expedientes', res);
  }

  async generarReporteExpedienteEmpleado(id: number, res: any) {
    await this.validacionService.validarEmpleado(id);

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

    if (!emp) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    const idsSubidos = emp.documentos.map((d) => d.id_tipo);
    const faltantes  = tiposDocumentos.filter((t) => !idsSubidos.includes(t.id_tipo));
    const porcentaje = tiposDocumentos.length > 0
      ? Math.round((emp.documentos.length / tiposDocumentos.length) * 100)
      : 100;

    const contenido: any[] = [
      ...this.headerBlock('EXPEDIENTE DE EMPLEADO', `${emp.nombre_empleado} ${emp.apellido_empleado}`),
    ];

    contenido.push({
      table: {
        widths: ['*'],
        body: [[{
          stack: [
            { text: 'DATOS DEL EMPLEADO', bold: true, fontSize: 9, color: COLOR_PRIMARY, margin: [0, 0, 0, 6] },
            {
              columns: [
                {
                  stack: [
                    this.filaInfoCompacta('DPI',       emp.dpi),
                    this.filaInfoCompacta('Correo',    emp.correo),
                    this.filaInfoCompacta('Teléfono',  emp.telefono),
                    this.filaInfoCompacta('Dirección', emp.direccion),
                  ],
                  width: '65%',
                },
                {
                  stack: [
                    { text: 'Estado Expediente', fontSize: 7, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 2] },
                    this.badgeEstado(emp.validacion?.estado || 'SIN VALIDAR'),
                    { text: ' ', margin: [0, 4] },
                    { text: 'Completado', fontSize: 7, bold: true, color: COLOR_MUTED, margin: [0, 0, 0, 2] },
                    { text: `${porcentaje}%`, fontSize: 18, bold: true, color: porcentaje === 100 ? COLOR_SUCCESS : COLOR_WARNING, alignment: 'right' },
                  ],
                  width: '35%',
                  alignment: 'right',
                },
              ],
            },
          ],
          margin: [8, 8, 8, 8],
        }]],
      },
      layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#CBD5E0', vLineColor: () => '#CBD5E0' },
      margin: [0, 0, 0, 8],
    });

    contenido.push({
      columns: [
        {
          stack: [
            this.seccionBlockSub(`✔  Documentos Subidos (${emp.documentos.length})`),
            ...(emp.documentos.length === 0
              ? [{ text: 'No se han subido documentos.', italics: true, color: COLOR_MUTED, fontSize: 8, margin: [4, 4] }]
              : [this.tablaConceptos([
                  ['#', 'Documento', 'Fecha de carga'],
                  ...emp.documentos.map((doc, i) => [
                    String(i + 1),
                    doc.tipo.nombre,
                    new Date(doc.fecha_carga).toLocaleDateString('es-GT'),
                  ]),
                ])]),
          ],
          width: '50%',
          margin: [0, 0, 4, 0],
        },
        {
          stack: [
            this.seccionBlockSub(`✘  Documentos Faltantes (${faltantes.length})`),
            ...(faltantes.length === 0
              ? [{ text: '✔  Expediente completo.', color: COLOR_SUCCESS, bold: true, fontSize: 8, margin: [4, 6] }]
              : [this.tablaConceptos([
                  ['#', 'Documento', 'Obligatorio'],
                  ...faltantes.map((f, i) => [String(i + 1), f.nombre, f.obligatorio ? 'Sí' : 'No']),
                ])]),
          ],
          width: '50%',
          margin: [4, 0, 0, 0],
        },
      ],
    });

    return this.generarPDF(contenido, `expediente_${id}`, res);
  }

  // ============================
  // HELPER ACADÉMICO
  // ============================

  private tarjetaInfoAcademica(acad: any, index: number): any {
    return {
      table: {
        widths: ['auto', '*', '*'],
        body: [[
          { text: String(index + 1), fontSize: 14, bold: true, color: COLOR_PRIMARY, alignment: 'center', margin: [4, 6, 8, 6] },
          {
            stack: [
              { text: acad.titulo, bold: true, fontSize: 9, color: COLOR_PRIMARY, margin: [0, 0, 0, 2] },
              this.filaInfoCompacta('Institución',   acad.institucion, 80),
              this.filaInfoCompacta('Certificación', acad.certificacion, 80),
            ],
            margin: [0, 4, 4, 4],
          },
          {
            stack: [
              this.filaInfoCompacta('Graduación', new Date(acad.fecha_graduacion).toLocaleDateString('es-GT'), 80),
            ],
            margin: [4, 4, 4, 4],
          },
        ]],
      },
      layout: {
        hLineWidth: () => 0.4,
        vLineWidth: (i: number) => i === 1 ? 0.4 : 0,
        hLineColor: () => '#CBD5E0',
        vLineColor: () => '#CBD5E0',
        fillColor: (rowIndex: number, node: any, columnIndex: number) => columnIndex === 0 ? COLOR_ACCENT : COLOR_WHITE,
      },
      margin: [0, 0, 0, 3],
    };
  }

  private seccionDocumentosAcademicos(todosLosDocumentos: any[], tiposDoc: any[]): any[] {
    const idsSubidos    = [...new Set(todosLosDocumentos.map((d: any) => d.id_tipo_doc_academico))];
    const faltantes     = tiposDoc.filter((t) => !idsSubidos.includes(t.id_tipo_doc_academico));
    const subidosUnicos = idsSubidos.map((id) => todosLosDocumentos.find((d: any) => d.id_tipo_doc_academico === id)).filter(Boolean);

    return [
      {
        columns: [
          {
            stack: [
              this.seccionBlockSub(`✔  Docs. Académicos Subidos (${subidosUnicos.length} / ${tiposDoc.length})`),
              ...(subidosUnicos.length === 0
                ? [{ text: 'Sin documentos subidos', fontSize: 7, color: COLOR_MUTED, italics: true, margin: [4, 4] }]
                : [this.tablaConceptos([
                    ['#', 'Documento'],
                    ...subidosUnicos.map((doc: any, i: number) => [String(i + 1), doc.tipo_doc.nombre]),
                  ])]),
            ],
            width: '50%',
            margin: [0, 0, 4, 0],
          },
          {
            stack: [
              this.seccionBlockSub(`✘  Docs. Académicos Faltantes (${faltantes.length})`),
              ...(faltantes.length === 0
                ? [{ text: 'Expediente académico completo', fontSize: 7, color: COLOR_MUTED, italics: true, margin: [4, 4] }]
                : [this.tablaConceptos([
                    ['#', 'Documento', 'Obligatorio'],
                    ...faltantes.map((f: any, i: number) => [String(i + 1), f.nombre, f.obligatorio ? 'Sí' : 'No']),
                  ])]),
            ],
            width: '50%',
            margin: [4, 0, 0, 0],
          },
        ],
        margin: [0, 4, 0, 8],
      },
    ];
  }

  // ============================
  // REPORTE GENERAL ACADÉMICO — diseño compacto
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

    // Resumen general compacto
    contenido.push({ text: 'RESUMEN GENERAL', style: 'subheader' });
    contenido.push(this.tablaConceptos([
      ['#', 'Empleado', 'Inf. Académica', 'Docs. Subidos', 'Docs. Faltantes'],
      ...empleados.map((emp, i) => {
        const todosLosDocs = emp.academicos.flatMap((a) => a.documentos);
        const idsSubidos   = [...new Set(todosLosDocs.map((d) => d.id_tipo_doc_academico))];
        const faltantes    = tiposDoc.filter((t) => !idsSubidos.includes(t.id_tipo_doc_academico));
        return [
          String(i + 1),
          `${emp.nombre_empleado} ${emp.apellido_empleado}`,
          String(emp.academicos.length),
          String(idsSubidos.length),
          String(faltantes.length),
        ];
      }),
    ]));

    contenido.push(this.seccionBlock('DETALLE POR EMPLEADO'));

    for (const emp of empleados) {
      if (emp.academicos.length === 0) continue;

      const todosLosDocs = emp.academicos.flatMap((a) => a.documentos);

      // Encabezado del empleado compacto
      contenido.push({
        table: {
          widths: ['*'],
          body: [[{
            columns: [
              { text: `${emp.nombre_empleado} ${emp.apellido_empleado}`, bold: true, fontSize: 10, color: COLOR_PRIMARY },
              { text: `${emp.academicos.length} registro(s) académico(s)`, fontSize: 8, color: COLOR_MUTED, alignment: 'right', italics: true },
            ],
            margin: [8, 6, 8, 6],
          }]],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => '#CBD5E0',
          fillColor: () => COLOR_ACCENT,
        },
        margin: [0, 4, 0, 3],
      });

      // Tarjetas académicas compactas
      for (let i = 0; i < emp.academicos.length; i++) {
        contenido.push(this.tarjetaInfoAcademica(emp.academicos[i], i));
      }

      // Documentos en dos columnas
      contenido.push(...this.seccionDocumentosAcademicos(todosLosDocs, tiposDoc));
    }

    return this.generarPDF(contenido, 'academicos', res);
  }

  // ============================
  // REPORTE ACADÉMICO EMPLEADO — diseño compacto
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

    if (!emp) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    const todosLosDocsEmp = emp.academicos.flatMap((a) => a.documentos);
    const idsSubidosEmp   = [...new Set(todosLosDocsEmp.map((d) => d.id_tipo_doc_academico))];
    const totalSubidos    = idsSubidosEmp.length;
    const totalFaltantes  = tiposDoc.filter((t) => !idsSubidosEmp.includes(t.id_tipo_doc_academico)).length;

    const contenido: any[] = [
      ...this.headerBlock('INFORMACIÓN ACADÉMICA', `${emp.nombre_empleado} ${emp.apellido_empleado}`),
    ];

    // Tarjeta resumen del empleado
    contenido.push({
      table: {
        widths: ['*'],
        body: [[{
          columns: [
            {
              stack: [
                this.filaInfoCompacta('Correo',    emp.correo),
                this.filaInfoCompacta('Teléfono',  emp.telefono),
                this.filaInfoCompacta('Dirección', emp.direccion),
              ],
              width: '55%',
            },
            {
              table: {
                widths: ['*', '*', '*'],
                body: [
                  [
                    { text: 'Registros',      fontSize: 7, bold: true, color: COLOR_MUTED, alignment: 'center' },
                    { text: 'Docs. Subidos',  fontSize: 7, bold: true, color: COLOR_MUTED, alignment: 'center' },
                    { text: 'Docs. Faltantes', fontSize: 7, bold: true, color: COLOR_MUTED, alignment: 'center' },
                  ],
                  [
                    { text: String(emp.academicos.length), fontSize: 16, bold: true, color: COLOR_PRIMARY, alignment: 'center' },
                    { text: String(totalSubidos),           fontSize: 16, bold: true, color: COLOR_SUCCESS, alignment: 'center' },
                    { text: String(totalFaltantes),         fontSize: 16, bold: true, color: totalFaltantes > 0 ? COLOR_WARNING : COLOR_MUTED, alignment: 'center' },
                  ],
                ],
              },
              layout: 'noBorders',
              width: '45%',
            },
          ],
          margin: [8, 8, 8, 8],
        }]],
      },
      layout: { hLineWidth: () => 0.5, vLineWidth: () => 0.5, hLineColor: () => '#CBD5E0', vLineColor: () => '#CBD5E0' },
      margin: [0, 0, 0, 8],
    });

    if (emp.academicos.length === 0) {
      contenido.push({ text: 'Este empleado no tiene información académica registrada.', italics: true, color: COLOR_MUTED, fontSize: 8, margin: [0, 8] });
      return this.generarPDF(contenido, `academico_${id}`, res);
    }

    contenido.push(this.seccionBlock('INFORMACIÓN ACADÉMICA'));
    for (let i = 0; i < emp.academicos.length; i++) {
      contenido.push(this.tarjetaInfoAcademica(emp.academicos[i], i));
    }

    contenido.push(...this.seccionDocumentosAcademicos(todosLosDocsEmp, tiposDoc));

    return this.generarPDF(contenido, `academico_${id}`, res);
  }

  // ============================
  // REPORTE NÓMINAS POR EMPLEADO
  // ============================

  async generarReporteNominasPorEmpleado(id: number, res: any) {
    const emp = await this.prisma.empleado.findUnique({
      where: { id_empleado: id },
      include: { puesto: true, departamento: true },
    });

    if (!emp) throw new NotFoundException(`El empleado con ID ${id} no existe`);

    const detalles = await this.prisma.detalleNomina.findMany({
      where: { id_empleado: id, eliminado: { not: true } },
      include: {
        nomina: true,
        empleado: { include: { puesto: true, departamento: true } },
        conceptos: { where: { eliminado: { not: true } }, include: { concepto: true } },
      },
      orderBy: { nomina: { fecha_creacion: 'desc' } },
    });

    const totalAcumulado = detalles.reduce((acc, d) => acc + Number(d.total_liquido ?? 0), 0);

    const contenido: any[] = [
      ...this.headerBlock('HISTORIAL DE BOLETAS', `${emp.nombre_empleado} ${emp.apellido_empleado}  ·  ${detalles.length} nóminas`),
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              { text: 'Empleado',             fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
              { text: 'Nóminas Participadas', fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
              { text: 'Total Acumulado',      fontSize: 8, bold: true, color: COLOR_MUTED, alignment: 'center' },
            ],
            [
              { text: `${emp.nombre_empleado} ${emp.apellido_empleado}`, fontSize: 11, bold: true, color: COLOR_PRIMARY, alignment: 'center' },
              { text: String(detalles.length), fontSize: 18, bold: true, color: COLOR_PRIMARY, alignment: 'center' },
              { text: `Q${totalAcumulado.toFixed(2)}`, fontSize: 14, bold: true, color: COLOR_SUCCESS, alignment: 'center' },
            ],
          ],
        },
        layout: 'noBorders',
        fillColor: COLOR_ACCENT,
        margin: [0, 0, 0, 16],
      },
    ];

    if (detalles.length === 0) {
      contenido.push({ text: 'Este empleado no ha participado en ninguna nómina.', italics: true, color: COLOR_MUTED, margin: [0, 8] });
      return this.generarPDF(contenido, `boletas_empleado_${id}`, res);
    }

    for (let i = 0; i < detalles.length; i++) {
      if (i > 0) contenido.push({ text: '', pageBreak: 'before' });
      contenido.push(...this.baucherPago(detalles[i], detalles[i].nomina));
    }

    return this.generarPDF(contenido, `boletas_empleado_${id}`, res);
  }

  // ============================
  // REPORTE DETALLE EMPLEADO EN NÓMINA ESPECÍFICA
  // ============================

  async generarReporteDetalleEmpleadoEnNomina(nominaId: number, empleadoId: number, res: any) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina: nominaId },
    });

    if (!nomina) throw new NotFoundException(`La nómina con ID ${nominaId} no existe`);

    const detalle = await this.prisma.detalleNomina.findFirst({
      where: { id_nomina: nominaId, id_empleado: empleadoId, eliminado: { not: true } },
      include: {
        empleado: { include: { puesto: true, departamento: true } },
        conceptos: { include: { concepto: true } },
      },
    });

    if (!detalle) throw new NotFoundException(`El empleado con ID ${empleadoId} no tiene detalle en la nómina ${nominaId}`);

    return this.generarPDF(
      [...this.baucherPago(detalle, nomina)],
      `baucher_nomina${nominaId}_emp${empleadoId}`,
      res,
    );
  }
}