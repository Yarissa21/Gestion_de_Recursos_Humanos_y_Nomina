import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConceptoDto } from './dto/create-concepto.dto';
import { UpdateConceptoDto } from './dto/update-concepto.dto';

const TIPOS_VALIDOS = ['Bonificacion', 'Comision', 'Deduccion', 'Descuento'];

@Injectable()
export class ConceptoNominaService {
  constructor(private prisma: PrismaService) {}

  private validarConcepto(dto: CreateConceptoDto | UpdateConceptoDto) {
    if (dto.tipo && !TIPOS_VALIDOS.includes(dto.tipo))
      throw new BadRequestException(`El tipo debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);

    const camposLlenos = [
      dto.porcentaje != null,
      dto.monto_fijo != null,
      dto.fecha_aplica != null,
    ].filter(Boolean).length;

    if (camposLlenos > 1)
      throw new BadRequestException('Solo puedes usar uno: porcentaje, monto fijo o fecha de aplicación');
  }

  async crearConcepto(dto: CreateConceptoDto) {
    this.validarConcepto(dto);

    const existente = await this.prisma.conceptoNomina.findFirst({
      where: { nombre: { equals: dto.nombre, mode: 'insensitive' }, eliminado: false },
    });
    if (existente)
      throw new ConflictException(`Ya existe un concepto con el nombre "${dto.nombre}"`);

    return this.prisma.conceptoNomina.create({ data: dto });
  }

  async listarConceptos() {
    return this.prisma.conceptoNomina.findMany({ where: { eliminado: false } });
  }

  async obtenerConcepto(id_concepto: number) {
    const concepto = await this.prisma.conceptoNomina.findUnique({ where: { id_concepto } });
    if (!concepto || concepto.eliminado)
      throw new NotFoundException('Concepto no encontrado');
    return concepto;
  }

  async actualizarConcepto(id_concepto: number, dto: UpdateConceptoDto) {
    await this.obtenerConcepto(id_concepto);

    this.validarConcepto(dto);

    if (dto.nombre) {
      const existente = await this.prisma.conceptoNomina.findFirst({
        where: {
          nombre: { equals: dto.nombre, mode: 'insensitive' },
          eliminado: false,
          NOT: { id_concepto },
        },
      });
      if (existente)
        throw new ConflictException(`Ya existe un concepto con el nombre "${dto.nombre}"`);
    }

    return this.prisma.conceptoNomina.update({ where: { id_concepto }, data: dto });
  }

  async eliminarConcepto(id_concepto: number) {
    await this.obtenerConcepto(id_concepto);
    return this.prisma.conceptoNomina.update({
      where: { id_concepto },
      data: { eliminado: true },
    });
  }
}