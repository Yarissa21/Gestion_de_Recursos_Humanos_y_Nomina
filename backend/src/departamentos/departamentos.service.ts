import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}

  async crearDepartamento(dto: CreateDepartamentoDto) {
    const existente = await this.prisma.departamento.findFirst({
      where: {
        nombre_departamento: { equals: dto.nombre_departamento.trim(), mode: 'insensitive' },
        eliminado: false,
      },
    });
    if (existente)
      throw new ConflictException(`Ya existe un departamento con el nombre "${dto.nombre_departamento}"`);

    return this.prisma.departamento.create({
      data: { nombre_departamento: dto.nombre_departamento.trim() },
    });
  }

  async listarDepartamentos() {
    return this.prisma.departamento.findMany({ where: { eliminado: false } });
  }

  async actualizarDepartamento(id: number, dto: UpdateDepartamentoDto) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id_departamento: id },
    });
    if (!departamento || departamento.eliminado)
      throw new NotFoundException(`Departamento con id ${id} no existe`);

    if (dto.nombre_departamento !== undefined && !dto.nombre_departamento.trim())
      throw new BadRequestException('El nombre del departamento no puede estar vacío');

    if (dto.nombre_departamento) {
      const existente = await this.prisma.departamento.findFirst({
        where: {
          nombre_departamento: { equals: dto.nombre_departamento.trim(), mode: 'insensitive' },
          eliminado: false,
          NOT: { id_departamento: id },
        },
      });
      if (existente)
        throw new ConflictException(`Ya existe un departamento con el nombre "${dto.nombre_departamento}"`);
    }

    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: {
        ...(dto.nombre_departamento && { nombre_departamento: dto.nombre_departamento.trim() }),
      },
    });
  }

  async eliminarDepartamento(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id_departamento: id },
    });
    if (!departamento || departamento.eliminado)
      throw new NotFoundException(`Departamento con id ${id} no existe`);

    const empleadosAsignados = await this.prisma.empleado.count({
      where: { id_departamento: id, eliminado: false },
    });
    if (empleadosAsignados > 0)
      throw new BadRequestException(`No se puede eliminar el departamento porque tiene ${empleadosAsignados} empleado(s) asignado(s)`);

    const puestosAsignados = await this.prisma.puestoTrabajo.count({
      where: { id_departamento: id, eliminado: false },
    });
    if (puestosAsignados > 0)
      throw new BadRequestException(`No se puede eliminar el departamento porque tiene ${puestosAsignados} puesto(s) asignado(s)`);

    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: { eliminado: true },
    });
  }
}