import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { CreateDetalleNominaDto } from './dto/create-detalle-nomina.dto';
import { UpdateDetalleNominaDto } from './dto/update-detalle-nomina.dto';
import { CreateDetalleConceptoDto } from './dto/create-detalle-concepto.dto';
import { UpdateDetalleConceptoDto } from './dto/update-detalle-concepto.dto';
import { EstadoNomina } from '@prisma/client';

@Injectable()
export class NominaService {
  constructor(private prisma: PrismaService) {}

  async crearNomina(dto: CreateNominaDto) {
    return this.prisma.nomina.create({
      data: {
        periodo: dto.periodo,
        tipo: dto.tipo,
        fecha_creacion: new Date(),
        estado: 'Pendiente',
      },
    });
  }

  async listarNominas() {
    return this.prisma.nomina.findMany({
    where: { eliminado: false },
   });
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
    await this.obtenerNomina(id);
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

  //_________________________Detalle Nomina______________________________
  async crearDetalleNomina(id_nomina: number, dto: CreateDetalleNominaDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: dto.id_empleado },
    });
    if (!empleado) throw new NotFoundException('Empleado no encontrado');

    return this.prisma.detalleNomina.create({
      data: {
        salario_base: empleado.salario, 
        horas_trabajadas: dto.horas_trabajadas,
        horas_extra: dto.horas_extra,
        id_nomina,
        id_empleado: dto.id_empleado,
      },
    });
  }

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

  async actualizarDetalleNomina(id_detalle: number, dto: UpdateDetalleNominaDto) {
    await this.obtenerDetalleNomina(id_detalle);
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
  async crearDetalleConcepto(id_detalle: number, dto: CreateDetalleConceptoDto) {
    const detalle = await this.prisma.detalleNomina.findUnique({ where: { id_detalle } });
    if (!detalle || detalle.eliminado) throw new NotFoundException('Detalle de nómina no encontrado');

    const concepto = await this.prisma.conceptoNomina.findUnique({ where: { id_concepto: dto.id_concepto } });
    if (!concepto || concepto.eliminado) throw new NotFoundException('Concepto no encontrado');

    let montoCalculado = dto.monto ?? 0;

    switch (concepto.nombre) {
      case 'IGSS':
        montoCalculado = detalle.salario_base * 0.0483; // 4.83% del salario base
        break;
      case 'ISR':
        montoCalculado = detalle.salario_base * 0.05; // ejemplo simplificado
        break;
      // otros conceptos porcentuales...
      default:
        // Bonificación, Comisión, Descuento → usan el monto enviado
        montoCalculado = dto.monto ?? 0;
        break;
    }

    return this.prisma.detalleConceptoNomina.create({
      data: {
        monto: montoCalculado,
        id_detalle,
        id_concepto: dto.id_concepto,
      },
    });
  }

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

  async actualizarDetalleConcepto(id_detalle_concepto: number, dto: UpdateDetalleConceptoDto) {
    await this.obtenerDetalleConcepto(id_detalle_concepto);
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
  async recalcularNomina(id_nomina: number) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina },
      include: {
        detalles: {
          include: {
            conceptos: { include: { concepto: true } },
          },
        },
      },
    });

    if (!nomina) throw new NotFoundException('Nómina no encontrada');

    const resultados: {
      empleado: number;
      salario_base: number;
      horas_trabajadas: number;
      horas_extra: number;
      pagoHorasNormales: number;
      pagoHorasExtra: number;
      bonificaciones: number;
      deducciones: number;
      total: number;
    }[] = [];

    for (const detalle of nomina.detalles) {
      const tarifaHora = detalle.salario_base / 160;

      let pagoHorasNormales = detalle.salario_base;
      if (nomina.tipo === 'Quincenal') {
        pagoHorasNormales = detalle.salario_base / 2;
      }

      const pagoHorasExtra = detalle.horas_extra * tarifaHora * 1.5;

      const bonificaciones = detalle.conceptos
        .filter(c => c.concepto.tipo === 'Bonificacion' || c.concepto.tipo === 'Comision')
        .reduce((sum, c) => sum + c.monto, 0);

      const deducciones = detalle.conceptos
        .filter(c => c.concepto.tipo === 'Deduccion' || c.concepto.tipo === 'Descuento')
        .reduce((sum, c) => sum + c.monto, 0);

      const total = pagoHorasNormales + pagoHorasExtra + bonificaciones - deducciones;

      await this.prisma.detalleNomina.update({
        where: { id_detalle: detalle.id_detalle },
        data: { total_liquido: total },
      });

      resultados.push({
        empleado: detalle.id_empleado,
        salario_base: detalle.salario_base,
        horas_trabajadas: detalle.horas_trabajadas,
        horas_extra: detalle.horas_extra,
        pagoHorasNormales,
        pagoHorasExtra,
        bonificaciones,
        deducciones,
        total,
      });
    }

    const nominaProcesada = await this.prisma.nomina.update({
      where: { id_nomina: nomina.id_nomina },
      data: { estado: 'Procesada' },
    });

    return {
      nomina: nominaProcesada.id_nomina,
      periodo: nominaProcesada.periodo,
      tipo: nominaProcesada.tipo,
      estado: nominaProcesada.estado,
      resultados,
    };
  }

}
