import { Injectable, NotFoundException } from '@nestjs/common';
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
    const nomina = await this.prisma.nomina.create({
      data: {
        periodo: dto.periodo,
        tipo: dto.tipo,
        fecha_creacion: new Date(),
        estado: 'Pendiente',
      },
    });

    const empleados = await this.prisma.empleado.findMany({ where: { eliminado: false } });

    for (const empleado of empleados) {
      const detalle = await this.prisma.detalleNomina.create({
        data: {
          salario_base: empleado.salario,
          horas_trabajadas: 0,
          horas_extra: 0,
          id_nomina: nomina.id_nomina,
          id_empleado: empleado.id_empleado,
        },
      });

      await this.aplicarConceptosAutomaticos(detalle.id_detalle, detalle.salario_base);
    }

    return nomina;
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

  private calcularMontoConcepto(concepto: any, salario_base: number): number {
    switch (concepto.nombre) {
      case 'IGSS':
        return salario_base * 0.0483; 
      case 'ISR':
        return salario_base * 0.05;   
      default:
        return 0; 
    }
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
  async recalcularNomina(id_nomina: number) {
    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina },
      include: { detalles: { include: { conceptos: { include: { concepto: true } } } } },
    });

    if (!nomina) throw new NotFoundException('Nómina no encontrada');

    const conceptosCatalogo = await this.prisma.conceptoNomina.findMany({ where: { eliminado: false } });

    for (const detalle of nomina.detalles) {
      const idsExistentes = detalle.conceptos.map(c => c.id_concepto);

      for (const concepto of conceptosCatalogo) {
        if (!idsExistentes.includes(concepto.id_concepto)) {
          const monto = this.calcularMontoConcepto(concepto, detalle.salario_base);
          await this.prisma.detalleConceptoNomina.create({
            data: { monto, id_detalle: detalle.id_detalle, id_concepto: concepto.id_concepto },
          });
        }
      }
    }

    const resultados: any[] = [];
    for (const detalle of nomina.detalles) {
      const tarifaHora = detalle.salario_base / 160;
      let pagoHorasNormales = nomina.tipo === 'Quincenal' ? detalle.salario_base / 2 : detalle.salario_base;
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
