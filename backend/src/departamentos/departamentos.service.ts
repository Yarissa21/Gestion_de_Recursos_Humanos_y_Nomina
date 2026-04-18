import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';

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
}

