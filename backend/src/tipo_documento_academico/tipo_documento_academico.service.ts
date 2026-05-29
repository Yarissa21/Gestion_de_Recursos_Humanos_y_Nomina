import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTipoDocumentoAcademicoDto } from './dto/create-tipo-documento-academico.dto';
import { UpdateTipoDocumentoAcademicoDto } from './dto/update-tipo-documento-academico.dto';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Injectable()
export class TipoDocumentoAcademicoService {
  constructor(
    private prisma: PrismaService,
    private validacionService: ValidacionExpedienteService,
  ) {}

  async crear(dto: CreateTipoDocumentoAcademicoDto) {
    const existente = await this.prisma.tipoDocumentoAcademico.findFirst({
      where: { nombre: { equals: dto.nombre.trim(), mode: 'insensitive' }, eliminado: false },
    });
    if (existente)
      throw new ConflictException(`Ya existe un tipo con el nombre "${dto.nombre}"`);

    return this.prisma.tipoDocumentoAcademico.create({
      data: { nombre: dto.nombre.trim(), obligatorio: dto.obligatorio },
    });
  }

  async listar() {
    return this.prisma.tipoDocumentoAcademico.findMany({ where: { eliminado: false } });
  }

  async obtener(id: number) {
    const tipo = await this.prisma.tipoDocumentoAcademico.findFirst({
      where: { id_tipo_doc_academico: id, eliminado: false },
    });
    if (!tipo)
      throw new NotFoundException(`Tipo con id ${id} no existe`);
    return tipo;
  }

  async actualizar(id: number, dto: UpdateTipoDocumentoAcademicoDto) {
    await this.obtener(id);

    if (dto.nombre) {
      const existente = await this.prisma.tipoDocumentoAcademico.findFirst({
        where: {
          nombre: { equals: dto.nombre.trim(), mode: 'insensitive' },
          eliminado: false,
          NOT: { id_tipo_doc_academico: id },
        },
      });
      if (existente)
        throw new ConflictException(`Ya existe un tipo con el nombre "${dto.nombre}"`);
    }

    return this.prisma.tipoDocumentoAcademico.update({
      where: { id_tipo_doc_academico: id },
      data: {
        ...(dto.nombre && { nombre: dto.nombre.trim() }),
        ...(dto.obligatorio !== undefined && { obligatorio: dto.obligatorio }),
      },
    });
  }

  async eliminar(id: number) {
    await this.obtener(id);

    const resultado = await this.prisma.tipoDocumentoAcademico.update({
      where: { id_tipo_doc_academico: id },
      data: { eliminado: true },
    });

    await this.validacionService.validarTodos();

    return resultado;
  }
}