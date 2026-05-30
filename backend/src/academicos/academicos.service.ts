import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicoDto } from './dto/create-academico.dto';
import { UpdateAcademicoDto } from './dto/update-academico.dto';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Injectable()
export class AcademicosService {
  constructor(
    private prisma: PrismaService,
    private validacionService: ValidacionExpedienteService,
  ) {}

  // ============================
  // ACADÉMICOS
  // ============================

  async crearAcademico(dto: CreateAcademicoDto) {
    const empleado = await this.prisma.empleado.findUnique({
      where: { id_empleado: dto.id_empleado },
    });
    if (!empleado || empleado.eliminado)
      throw new NotFoundException(`Empleado con id ${dto.id_empleado} no existe`);

    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    if (new Date(dto.fecha_graduacion) > hoy)
      throw new BadRequestException('La fecha de graduación no puede ser futura');

    const existente = await this.prisma.informacionAcademica.findFirst({
      where: { id_empleado: dto.id_empleado, eliminado: false } as any,
    });
    if (existente)
      throw new BadRequestException('Este empleado ya tiene un registro académico. Edítalo o elimínalo primero.');

    return this.prisma.informacionAcademica.create({
      data: {
        titulo:           dto.titulo,
        certificacion:    dto.certificacion,
        institucion:      dto.institucion,
        fecha_graduacion: dto.fecha_graduacion,
        id_empleado:      dto.id_empleado,
      },
    });
  }

  async listarAcademicos() {
    return this.prisma.informacionAcademica.findMany({
      where: { eliminado: false } as any,
      include: { empleado: true },
    });
  }

  async obtenerPorEmpleado(id_empleado: number) {
    return this.prisma.informacionAcademica.findMany({
      where: { id_empleado, eliminado: false } as any,
      include: {
        empleado: true,
        documentos: {
          where: { eliminado: false },
          select: {
            id_doc_academico:     true,
            nombre:               true,
            fecha_carga:          true,
            id_academico:         true,
            id_tipo_doc_academico: true,
            tipo_doc: { select: { nombre: true } },
          },
        },
      },
    });
  }

  async actualizarAcademico(id: number, dto: UpdateAcademicoDto, id_empleado: number) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
    });
    if (!academico || (academico as any).eliminado)
      throw new NotFoundException(`Académico con id ${id} no existe`);

    if (academico.id_empleado !== id_empleado)
      throw new ForbiddenException('No tienes permiso para editar este registro');

    if (dto.fecha_graduacion) {
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (new Date(dto.fecha_graduacion) > hoy)
        throw new BadRequestException('La fecha de graduación no puede ser futura');
    }

    return this.prisma.informacionAcademica.update({
      where: { id_academico: id },
      data: {
        titulo:           dto.titulo,
        certificacion:    dto.certificacion,
        institucion:      dto.institucion,
        fecha_graduacion: dto.fecha_graduacion,
      },
    });
  }

  async eliminarAcademico(id: number, id_empleado: number) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: id },
      include: { documentos: { where: { eliminado: false } } },
    });
    if (!academico || (academico as any).eliminado)
      throw new NotFoundException(`Académico con id ${id} no existe`);

    if (academico.id_empleado !== id_empleado)
      throw new ForbiddenException('No tienes permiso para eliminar este registro');

    const idDocs = academico.documentos.map((d) => d.id_doc_academico);

    await this.prisma.$transaction(async (tx) => {
      if (idDocs.length > 0)
        await tx.documentoAcademico.updateMany({
          where: { id_doc_academico: { in: idDocs } },
          data: { eliminado: true },
        });

      await tx.informacionAcademica.update({
        where: { id_academico: id },
        data: { eliminado: true } as any,
      });
    });

    await this.validacionService.validarEmpleado(id_empleado);

    return { message: `Registro académico ${id} eliminado correctamente` };
  }

  // ============================
  // DOCUMENTOS ACADÉMICOS
  // ============================

  async subirDocumento(data: any) {
    const academico = await this.prisma.informacionAcademica.findUnique({
      where: { id_academico: data.id_academico },
    });
    if (!academico || (academico as any).eliminado)
      throw new NotFoundException(`Académico con id ${data.id_academico} no existe`);

    const tipoDoc = await this.prisma.tipoDocumentoAcademico.findUnique({
      where: { id_tipo_doc_academico: data.id_tipo_doc_academico },
    });
    if (!tipoDoc || tipoDoc.eliminado)
      throw new NotFoundException(`Tipo de documento con id ${data.id_tipo_doc_academico} no existe`);

    const doc = await this.prisma.documentoAcademico.create({ data });

    await this.validacionService.validarEmpleado(academico.id_empleado);

    return doc;
  }

  async listarDocumentos() {
    return this.prisma.documentoAcademico.findMany({
      where: { eliminado: false },
      select: {
        id_doc_academico:     true,
        nombre:               true,
        fecha_carga:          true,
        eliminado:            true,
        id_academico:         true,
        id_tipo_doc_academico: true,
        academico: {
          select: {
            id_academico: true,
            empleado: {
              select: { nombre_empleado: true, apellido_empleado: true },
            },
          },
        },
        tipo_doc: { select: { nombre: true } },
        usuario:  { select: { id_usuario: true, nombre: true } },
      },
    });
  }

  async obtenerDocumento(id: number) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
    });
    if (!doc)
      throw new NotFoundException(`Documento con id ${id} no existe`);
    return doc;
  }

  async actualizarDocumento(id: number, dto: any) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
    });
    if (!doc || doc.eliminado)
      throw new NotFoundException(`Documento con id ${id} no existe`);

    return this.prisma.documentoAcademico.update({
      where: { id_doc_academico: id },
      data: dto,
    });
  }

  async eliminarDocumento(id: number) {
    const doc = await this.prisma.documentoAcademico.findUnique({
      where: { id_doc_academico: id },
      include: {
        academico: true,
      },
    });
    if (!doc || doc.eliminado)
      throw new NotFoundException(`Documento con id ${id} no existe`);

    const resultado = await this.prisma.documentoAcademico.update({
      where: { id_doc_academico: id },
      data: { eliminado: true },
    });

    await this.validacionService.validarEmpleado(doc.academico.id_empleado);

    return resultado;
  }
}