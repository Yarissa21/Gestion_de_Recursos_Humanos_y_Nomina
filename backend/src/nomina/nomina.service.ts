import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominaDto } from './dto/create-nomina.dto';
import { UpdateNominaDto } from './dto/update-nomina.dto';
import { CreateDetalleNominaDto } from './dto/create-detalle-nomina.dto';
import { UpdateDetalleNominaDto } from './dto/update-detalle-nomina.dto';

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
      pagoHorasExtra: number;
      bonificaciones: number;
      deducciones: number;
      total: number;
    }[] = [];

    for (const detalle of nomina.detalles) {
      const tarifaHora = detalle.salario_base / 160;
      const pagoHorasExtra = detalle.horas_extra * tarifaHora * 1.5;

      const bonificaciones = detalle.conceptos
        .filter(c => c.concepto.tipo === 'BONIFICACION' || c.concepto.tipo === 'COMISION')
        .reduce((sum, c) => sum + c.monto, 0);

      const deducciones = detalle.conceptos
        .filter(c => c.concepto.tipo === 'DEDUCCION' || c.concepto.tipo === 'DESCUENTO')
        .reduce((sum, c) => sum + c.monto, 0);

      const total = detalle.salario_base + pagoHorasExtra + bonificaciones - deducciones;

      await this.prisma.detalleNomina.update({
        where: { id_detalle: detalle.id_detalle },
        data: { total_liquido: total },
      });

      resultados.push({
        empleado: detalle.id_empleado,
        salario_base: detalle.salario_base,
        horas_trabajadas: detalle.horas_trabajadas,
        horas_extra: detalle.horas_extra,
        pagoHorasExtra,
        bonificaciones,
        deducciones,
        total,
      });
    }

    return {
      nomina: nomina.id_nomina,
      periodo: nomina.periodo,
      tipo: nomina.tipo,
      estado: nomina.estado,
      resultados,
    };
  }

}
