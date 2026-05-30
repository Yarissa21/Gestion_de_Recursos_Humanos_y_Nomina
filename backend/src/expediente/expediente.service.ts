import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Injectable()
export class ExpedienteService {
  constructor(
    private prisma: PrismaService,
    private validacionService: ValidacionExpedienteService,
  ) {}

  async subirDocumento(data: any) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: data.id_empleado },
    });
    if (!empleado || empleado.eliminado)
      throw new NotFoundException(`Empleado con id ${data.id_empleado} no existe`);

    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: { id_tipo: data.id_tipo, eliminado: false },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo de documento con id ${data.id_tipo} no existe`);

    const doc = await this.prisma.documentoExpediente.create({ data });

    await this.validacionService.validarEmpleado(data.id_empleado);

    return doc;
  }

  async listarDocumentos() {
    return this.prisma.documentoExpediente.findMany({
      where: { eliminado: false },
      select: {
        id_documento: true,
        nombre_documento: true,
        fecha_carga: true,
        eliminado: true,
        id_tipo: true,
        id_empleado: true,
        empleado: {
          select: {
            nombre_empleado: true,
            apellido_empleado: true,
          },
        },
        tipo: {
          select: { nombre: true },
        },
        usuario: {
          select: {
            id_usuario: true,
            nombre: true,
          },
        },
      },
    });
  }

  async obtenerDocumento(id: number) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });
    if (!doc || doc.eliminado)
      throw new NotFoundException(`Documento con id ${id} no existe`);
    return doc;
  }

  async obtenerDocumentosPorEmpleado(id_empleado: number) {
    return this.prisma.documentoExpediente.findMany({
      where: { id_empleado, eliminado: false },
      include: { tipo: true, usuario: true, empleado: true },
    });
  }

  async actualizarDocumento(id: number, dto: any) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });
    if (!doc || doc.eliminado)
      throw new NotFoundException(`Documento con id ${id} no existe`);

    return this.prisma.documentoExpediente.update({
      where: { id_documento: id },
      data: dto,
    });
  }

  async eliminarDocumento(id: number) {
    const doc = await this.prisma.documentoExpediente.findUnique({
      where: { id_documento: id },
    });
    if (!doc || doc.eliminado)
      throw new NotFoundException(`Documento con id ${id} no existe`);

    const resultado = await this.prisma.documentoExpediente.update({
      where: { id_documento: id },
      data: { eliminado: true },
    });

    await this.validacionService.validarEmpleado(doc.id_empleado);

    return resultado;
  }

  // ============================
  // TIPOS DOCUMENTO
  // ============================

  async crearTipoDocumento(dto: CreateTipoDocumentoDto) {
    const existente = await this.prisma.tipoDocumento.findFirst({
      where: { nombre: { equals: dto.nombre.trim(), mode: 'insensitive' }, eliminado: false },
    });
    if (existente)
      throw new ConflictException(`Ya existe un tipo de documento con el nombre "${dto.nombre}"`);

    return this.prisma.tipoDocumento.create({
      data: { nombre: dto.nombre.trim(), obligatorio: dto.obligatorio },
    });
  }

  async listarTiposDocumento() {
    return this.prisma.tipoDocumento.findMany({ where: { eliminado: false } });
  }

  async obtenerTipoDocumento(id: number) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: { id_tipo: id, eliminado: false },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    return tipo;
  }

  async actualizarTipoDocumento(id: number, dto: UpdateTipoDocumentoDto) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: { id_tipo: id, eliminado: false },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo con id ${id} no existe`);

    if (dto.nombre) {
      const existente = await this.prisma.tipoDocumento.findFirst({
        where: {
          nombre: { equals: dto.nombre.trim(), mode: 'insensitive' },
          eliminado: false,
          NOT: { id_tipo: id },
        },
      });
      if (existente)
        throw new ConflictException(`Ya existe un tipo de documento con el nombre "${dto.nombre}"`);
    }

    return this.prisma.tipoDocumento.update({
      where: { id_tipo: id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.obligatorio !== undefined && { obligatorio: dto.obligatorio }),
      },
    });
  }

  async eliminarTipoDocumento(id: number) {
    const tipo = await this.prisma.tipoDocumento.findFirst({
      where: { id_tipo: id, eliminado: false },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo con id ${id} no existe`);

    const resultado = await this.prisma.tipoDocumento.update({
      where: { id_tipo: id },
      data: { eliminado: true },
    });

    await this.validacionService.validarTodos();

    return resultado;
  }
}