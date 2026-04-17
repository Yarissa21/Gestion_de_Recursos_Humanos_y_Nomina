import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';

@Injectable()
export class EmpleadosService {
  constructor(private prisma: PrismaService) {}

  async crearEmpleado(data: CreateEmpleadoDto) {
    
    if (!data.dpi || !data.nombre_empleado || !data.apellido_empleado) {
      throw new BadRequestException('El empleado debe tener DPI y nombre completo');
    }

    return this.prisma.empleado.create({ data });
  }
}

