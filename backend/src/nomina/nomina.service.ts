import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { UpdateDetalleNominaDto } from './dto/update-detalle-nomina.dto';
import { UpdateDetalleConceptoDto } from './dto/update-detalle-concepto.dto';
import { EstadoNomina } from '@prisma/client';

@Injectable()
export class NominaService {
  constructor(private prisma: PrismaService) {}

  async crearNomina(dto: CreateNominaDto) {
    const hoy = new Date();
    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const mesActual = meses[hoy.getMonth()];
    const anioActual = hoy.getFullYear();
    const diaHoy = hoy.getDate();
    const ultimoDiaMes = new Date(anioActual, hoy.getMonth() + 1, 0).getDate();

    if (dto.tipo === 'Mensual') {
      const esperado = `${mesActual} ${anioActual}`;
      if (dto.periodo !== esperado) {
        throw new BadRequestException(`Solo se puede crear la nómina mensual de ${esperado}`);
      }
      const existente = await this.prisma.nomina.findFirst({
        where: { periodo: dto.periodo, tipo: 'Mensual', eliminado: false },
      });
      if (existente) {
        throw new BadRequestException('Ya existe una nómina mensual para este periodo');
      }
      const quincenaExistente = await this.prisma.nomina.findFirst({
        where: {
          tipo: 'Quincenal',
          eliminado: false,
          OR: [
            { periodo: `Primera Quincena ${mesActual} ${anioActual}` },
            { periodo: `Segunda Quincena ${mesActual} ${anioActual}` },
          ],
        },
      });
      if (quincenaExistente) {
        throw new BadRequestException(
          `Ya existe una nómina quincenal de ${mesActual} ${anioActual}, no se puede crear una mensual para el mismo periodo`
        );
      }
    }

    if (dto.tipo === 'Quincenal') {
      const primera = `Primera Quincena ${mesActual} ${anioActual}`;
      const segunda = `Segunda Quincena ${mesActual} ${anioActual}`;

      if (dto.periodo === primera && !(diaHoy >= 1 && diaHoy <= 15)) {
        throw new BadRequestException(`La primera quincena solo puede crearse entre el 1 y el 15 de ${mesActual} ${anioActual}`);
      }
      if (dto.periodo === segunda && !(diaHoy >= 16 && diaHoy <= ultimoDiaMes)) {
        throw new BadRequestException(`La segunda quincena solo puede crearse entre el 16 y el ${ultimoDiaMes} de ${mesActual} ${anioActual}`);
      }
      if (dto.periodo !== primera && dto.periodo !== segunda) {
        throw new BadRequestException(`Las nóminas quincenales solo pueden ser "${primera}" o "${segunda}"`);
      }
      const existente = await this.prisma.nomina.findFirst({
        where: { periodo: dto.periodo, tipo: 'Quincenal', eliminado: false },
      });
      if (existente) {
        throw new BadRequestException('Ya existe una nómina quincenal para este periodo');
      }
      const mensualExistente = await this.prisma.nomina.findFirst({
        where: { periodo: `${mesActual} ${anioActual}`, tipo: 'Mensual', eliminado: false },
      });
      if (mensualExistente) {
        throw new BadRequestException(
          `Ya existe una nómina mensual de ${mesActual} ${anioActual}, no se puede crear una quincenal para el mismo periodo`
        );
      }
    }

    const nomina = await this.prisma.nomina.create({
      data: {
        periodo: dto.periodo,
        tipo: dto.tipo,
        fecha_creacion: new Date(),
        estado: 'Pendiente',
      },
    });

    const empleados = await this.prisma.empleado.findMany({
      where: { eliminado: false, estado: { not: 'Retirado' } },
    });

    const horasIniciales = dto.tipo === 'Quincenal' ? 96 : 191;

    for (const empleado of empleados) {
      const detalle = await this.prisma.detalleNomina.create({
        data: {
          salario_base: empleado.salario,
          horas_trabajadas: horasIniciales,
          horas_extra: 0,
          id_nomina: nomina.id_nomina,
          id_empleado: empleado.id_empleado,
        },
      });
      await this.aplicarConceptosAutomaticos(detalle.id_detalle, detalle.salario_base);
      await this.calcularTotalesDetalle(
        detalle.id_detalle,
        detalle.salario_base,
        horasIniciales,
        0,
        dto.tipo,
      );
    }

    return nomina;
  }

  async listarNominas() {
    return this.prisma.nomina.findMany({
    where: { eliminado: false },
   });
  }

  async listarNominasPorEmpleado(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      include: { empleado: true },
    });

    if (!usuario?.empleado) {
      return [];
    }

    const detalles = await this.prisma.detalleNomina.findMany({
      where: { id_empleado: usuario.empleado.id_empleado, eliminado: false },
      include: { nomina: true },
    });

    return detalles
      .map((d) => d.nomina)
      .filter((n) => !n.eliminado);
  }

  async obtenerNomina(id: number) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina: id },
    });
    if (!nomina) {
      throw new NotFoundException(`Nómina con id ${id} no existe`);
    }
    return nomina;
  }

  async actualizarNomina(id: number, dto: UpdateNominaDto) {
    const nomina = await this.obtenerNomina(id);

    const hoy = new Date();
    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const mesActual = meses[hoy.getMonth()];
    const anioActual = hoy.getFullYear();
    const diaHoy = hoy.getDate();
    const ultimoDiaMes = new Date(anioActual, hoy.getMonth() + 1, 0).getDate();

    const tipoNomina = dto.tipo ?? nomina.tipo;
    const periodoNomina = dto.periodo ?? nomina.periodo;

    if (tipoNomina === 'Mensual') {
      const esperado = `${mesActual} ${anioActual}`;
      if (periodoNomina !== esperado) {
        throw new BadRequestException(`El período para nómina mensual debe ser exactamente "${esperado}"`);
      }
      const existente = await this.prisma.nomina.findFirst({
        where: { periodo: periodoNomina, tipo: 'Mensual', eliminado: false, NOT: { id_nomina: id } },
      });
      if (existente) {
        throw new BadRequestException('Ya existe una nómina mensual para este periodo');
      }
    }

    if (tipoNomina === 'Quincenal') {
      const primera = `Primera Quincena ${mesActual} ${anioActual}`;
      const segunda = `Segunda Quincena ${mesActual} ${anioActual}`;

      if (periodoNomina === primera && !(diaHoy >= 1 && diaHoy <= 15)) {
        throw new BadRequestException(`La primera quincena solo puede actualizarse entre el 1 y el 15 de ${mesActual} ${anioActual}`);
      }
      if (periodoNomina === segunda && !(diaHoy >= 16 && diaHoy <= ultimoDiaMes)) {
        throw new BadRequestException(`La segunda quincena solo puede actualizarse entre el 16 y el ${ultimoDiaMes} de ${mesActual} ${anioActual}`);
      }
      if (periodoNomina !== primera && periodoNomina !== segunda) {
        throw new BadRequestException(`El período para nómina quincenal debe ser "${primera}" o "${segunda}"`);
      }
      const existente = await this.prisma.nomina.findFirst({
        where: { periodo: periodoNomina, tipo: 'Quincenal', eliminado: false, NOT: { id_nomina: id } },
      });
      if (existente) {
        throw new BadRequestException('Ya existe una nómina quincenal para este periodo');
      }
    }

    return this.prisma.nomina.update({
      where: { id_nomina: id },
      data: dto,
    });
  }

  async eliminarNomina(id: number) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina: id },
    });

    if (!nomina || nomina.eliminado) {
      throw new NotFoundException(`Nómina con id ${id} no existe o ya fue eliminada`);
    }

    return this.prisma.nomina.update({
      where: { id_nomina: id },
      data: { eliminado: true },
    });
  }

  async actualizarEstadoNomina(id_nomina: number, estado: EstadoNomina) {
    const nomina = await this.obtenerNomina(id_nomina);
    return this.prisma.nomina.update({
      where: { id_nomina },
      data: { estado },
    });
  }

  //_______________________Métodos Privados____________________________________

  private calcularMontoConcepto(concepto: any, salario_base: number): number {
    const hoy = new Date();

    if (concepto.porcentaje) {
      return salario_base * concepto.porcentaje;
    }

    if (concepto.monto_fijo) {
      return concepto.monto_fijo;
    }

    if (concepto.fecha_aplica) {
      if (concepto.fecha_aplica.getMonth() === hoy.getMonth()) {
        return salario_base; 
      }
    }

    return 0;
  }

  private async aplicarConceptosAutomaticos(id_detalle: number, salario_base: number) {
    const conceptos = await this.prisma.conceptoNomina.findMany({ where: { eliminado: false } });

    for (const concepto of conceptos) {
      const monto = this.calcularMontoConcepto(concepto, salario_base);
      await this.prisma.detalleConceptoNomina.create({
        data: { monto, id_detalle, id_concepto: concepto.id_concepto },
      });
    }
  }

  private async calcularTotalesDetalle(
    id_detalle: number,
    salario_base: number,
    horas_trabajadas: number,
    horas_extra: number,
    tipo_nomina: string,
  ) {
    const conceptos = await this.prisma.detalleConceptoNomina.findMany({
      where: { id_detalle, eliminado: false },
      include: { concepto: true },
    });

    const referenciaHoras = tipo_nomina === 'Quincenal' ? 96 : 191;

    if (horas_trabajadas > referenciaHoras) {
      const excedente = horas_trabajadas - referenciaHoras;
      horas_trabajadas = referenciaHoras;
      horas_extra += excedente;
    }

    if (horas_trabajadas < referenciaHoras && horas_extra > 0) {
      const faltantes = referenciaHoras - horas_trabajadas;
      const usadasDeExtra = Math.min(faltantes, horas_extra);
      horas_trabajadas += usadasDeExtra;
      horas_extra -= usadasDeExtra;
    }

    const tarifaHora = salario_base / 191;
    const pagoHorasNormales = Math.round(horas_trabajadas * tarifaHora * 100) / 100;
    const pagoHorasExtra = Math.round(horas_extra * tarifaHora * 1.5 * 100) / 100;

    const bonificaciones = Math.round(conceptos
      .filter(c => c.concepto.tipo === 'Bonificacion' || c.concepto.tipo === 'Comision')
      .reduce((sum, c) => sum + c.monto, 0) * 100) / 100;

    const deducciones = Math.round(conceptos
      .filter(c => c.concepto.tipo === 'Deduccion' || c.concepto.tipo === 'Descuento')
      .reduce((sum, c) => sum + c.monto, 0) * 100) / 100;

    const total = Math.round((pagoHorasNormales + pagoHorasExtra + bonificaciones - deducciones) * 100) / 100;

    await this.prisma.detalleNomina.update({
      where: { id_detalle },
      data: {
        horas_trabajadas,
        horas_extra,
        pago_horas_normales: pagoHorasNormales,
        pago_horas_extra: pagoHorasExtra,
        total_liquido: total,
      },
    });

    return {
      horas_trabajadas,
      horas_extra,
      pagoHorasNormales,
      pagoHorasExtra,
      bonificaciones,
      deducciones,
      total,
    };
  }

  //_________________________Detalle Nomina______________________________

  async listarDetallesNomina(id_nomina: number) {
    return this.prisma.detalleNomina.findMany({
      where: { id_nomina, eliminado: false },
    });
  }

  async obtenerDetalleNomina(id_detalle: number) {
    const detalle = await this.prisma.detalleNomina.findUnique({
      where: { id_detalle },
    });
    if (!detalle || detalle.eliminado) {
      throw new NotFoundException('Detalle no encontrado');
    }
    return detalle;
  }

  async actualizarDetalleNomina(id_detalle: number, dto: UpdateDetalleNominaDto, id_usuario: number,) {
    const detalle = await this.obtenerDetalleNomina(id_detalle);

    for (const campo of Object.keys(dto)) {
    const valorAnterior = (detalle as any)[campo];
    const valorNuevo = (dto as any)[campo];

      if (valorAnterior !== valorNuevo) {
        await this.prisma.ajusteNomina.create({
          data: {
            descripcion: `Cambio en ${campo}`,
            valor_anterior: valorAnterior,
            valor_nuevo: valorNuevo,
            campo_modificado: campo,
            fecha: new Date(),
            id_usuario,
            id_detalle,
          },
        });
      }
    }

    return this.prisma.detalleNomina.update({
      where: { id_detalle },
      data: dto,
    });
  }

  async eliminarDetalleNomina(id_detalle: number) {
    await this.obtenerDetalleNomina(id_detalle);
    return this.prisma.detalleNomina.update({
      where: { id_detalle },
      data: { eliminado: true },
    });
  }

  //________________________Detalle Concepto Nomina_______________________

  async listarDetalleConceptos(id_detalle: number) {
    return this.prisma.detalleConceptoNomina.findMany({
      where: { id_detalle, eliminado: false },
      include: { concepto: true },
    });
  }

  async obtenerDetalleConcepto(id_detalle_concepto: number) {
    const detalleConcepto = await this.prisma.detalleConceptoNomina.findUnique({
      where: { id_detalle_concepto },
      include: { concepto: true },
    });
    if (!detalleConcepto || detalleConcepto.eliminado) {
      throw new NotFoundException('Detalle concepto no encontrado');
    }
    return detalleConcepto;
  }

  async actualizarDetalleConcepto(id_detalle_concepto: number, dto: UpdateDetalleConceptoDto, id_usuario: number,) {
    const detalle_concepto = await this.obtenerDetalleConcepto(id_detalle_concepto);

    for (const campo of Object.keys(dto)) {
    const valorAnterior = (detalle_concepto as any)[campo];
    const valorNuevo = (dto as any)[campo];

      if (valorAnterior !== valorNuevo) {
        await this.prisma.ajusteNomina.create({
          data: {
            descripcion: `Cambio en ${campo}`,
            valor_anterior: valorAnterior,
            valor_nuevo: valorNuevo,
            campo_modificado: campo,
            fecha: new Date(),
            id_usuario,
            id_detalle_concepto,
          },
        });
      }
    }

    return this.prisma.detalleConceptoNomina.update({
      where: { id_detalle_concepto },
      data: dto,
    });
  }

  async eliminarDetalleConcepto(id_detalle_concepto: number) {
    await this.obtenerDetalleConcepto(id_detalle_concepto);
    return this.prisma.detalleConceptoNomina.update({
      where: { id_detalle_concepto },
      data: { eliminado: true },
    });
  }

  //_________________________Calcular Nomina______________________________
  async recalcularDetalle(id_detalle: number) {
    const detalle = await this.prisma.detalleNomina.findUnique({
      where: { id_detalle },
      include: { 
        nomina: true,
        conceptos: { include: { concepto: true } },
      },
    });

    if (!detalle || detalle.eliminado) {
      throw new NotFoundException('Detalle no encontrado');
    }

    const conceptosCatalogo = await this.prisma.conceptoNomina.findMany({
      where: { eliminado: false },
    });

    const idsExistentes = detalle.conceptos.map(c => c.id_concepto);

    for (const concepto of conceptosCatalogo) {
      if (idsExistentes.includes(concepto.id_concepto)) {
        const monto = this.calcularMontoConcepto(concepto, detalle.salario_base);
        await this.prisma.detalleConceptoNomina.updateMany({
          where: { id_detalle, id_concepto: concepto.id_concepto },
          data: { monto },
        });
      }
    }

    const totales = await this.calcularTotalesDetalle(
      id_detalle,
      detalle.salario_base,
      detalle.horas_trabajadas,
      detalle.horas_extra,
      detalle.nomina.tipo,
    );

    return {
      id_detalle,
      empleado: detalle.id_empleado,
      salario_base: detalle.salario_base,
      ...totales,
    };
  }

  async sincronizarEmpleadosNomina(id_nomina: number) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina },
      include: { 
        detalles: { 
          where: { eliminado: false },
          include: { conceptos: true },
        },
      },
    });

    if (!nomina) throw new NotFoundException('Nómina no encontrada');

    const conceptosCatalogo = await this.prisma.conceptoNomina.findMany({
      where: { eliminado: false },
    });

    const empleadosActivos = await this.prisma.empleado.findMany({
      where: { eliminado: false, estado: { not: 'Retirado' } },
    });

    const idsConDetalle = nomina.detalles.map(d => d.id_empleado);
    const horasIniciales = nomina.tipo === 'Quincenal' ? 96 : 191;
    const empleadosAgregados: number[] = [];
    let conceptosPropagados = 0;

    for (const detalle of nomina.detalles) {
      const idsExistentes = detalle.conceptos.map(c => c.id_concepto);
      const conceptosFaltantes = conceptosCatalogo.filter(
        c => !idsExistentes.includes(c.id_concepto),
      );

      for (const concepto of conceptosFaltantes) {
        const monto = this.calcularMontoConcepto(concepto, detalle.salario_base);
        await this.prisma.detalleConceptoNomina.create({
          data: { monto, id_detalle: detalle.id_detalle, id_concepto: concepto.id_concepto },
        });
        conceptosPropagados++;
      }
    }

    for (const empleado of empleadosActivos) {
      if (!idsConDetalle.includes(empleado.id_empleado)) {
        const detalle = await this.prisma.detalleNomina.create({
          data: {
            salario_base: empleado.salario,
            horas_trabajadas: horasIniciales,
            horas_extra: 0,
            id_nomina,
            id_empleado: empleado.id_empleado,
          },
        });
        await this.aplicarConceptosAutomaticos(detalle.id_detalle, detalle.salario_base);
        await this.calcularTotalesDetalle(
          detalle.id_detalle,
          detalle.salario_base,
          horasIniciales,
          0,
          nomina.tipo,
        );
        empleadosAgregados.push(empleado.id_empleado);
      }
    }

    return {
      empleados_sincronizados: empleadosAgregados.length,
      conceptos_propagados: conceptosPropagados,
      empleados_agregados: empleadosAgregados,
      mensaje: empleadosAgregados.length === 0 && conceptosPropagados === 0
        ? 'La nómina ya está sincronizada'
        : `Se agregaron ${empleadosAgregados.length} empleado(s) y se propagaron ${conceptosPropagados} concepto(s) faltante(s)`,
    };
  }

  // __________________Historial_Ajuste_Nomina__________________

  async historialNomina(id_nomina: number) {
    return this.prisma.ajusteNomina.findMany({
      where: {
        OR: [
          { detalle: { id_nomina } },
          { detalleConcepto: { detalle: { id_nomina } } },
        ],
      },
      include: {
        usuario: true,
        detalle: true,
        detalleConcepto: true,
      },
      orderBy: { fecha: 'desc' },
    });
  }

}
