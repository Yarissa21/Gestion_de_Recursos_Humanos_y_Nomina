import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { UpdateDepartamentoDto } from './dto/update-departamento.dto';

@Injectable()
export class DepartamentosService {
  constructor(private prisma: PrismaService) {}

  async crearDepartamento(dto: CreateDepartamentoDto) {
    return this.prisma.departamento.create({
      data: {
        nombre_departamento: dto.nombre_departamento,
      },
    });
  }

  async listarDepartamentos() {
    return this.prisma.departamento.findMany({
      where: { eliminado: false },
    });
  }

  async actualizarDepartamento(id: number, dto: UpdateDepartamentoDto) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id_departamento: id },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con id ${id} no existe`);
    }

    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: {
        nombre_departamento: dto.nombre_departamento,
      },
    });
  }

  async eliminarDepartamento(id: number) {
    const departamento = await this.prisma.departamento.findUnique({
      where: { id_departamento: id },
    });

    if (!departamento) {
      throw new NotFoundException(`Departamento con id ${id} no existe`);
    }

    return this.prisma.departamento.update({
      where: { id_departamento: id },
      data: { eliminado: true },
    });
  }
}
