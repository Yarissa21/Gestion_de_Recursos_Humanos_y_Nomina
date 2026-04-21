import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNominaDto } from './dto/create-nomina.dto';

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
}
