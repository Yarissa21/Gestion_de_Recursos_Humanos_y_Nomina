import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NominaEditableGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const id_nomina = Number(
      request.params.id ?? request.body.id_nomina,
    );

    if (!id_nomina || isNaN(id_nomina)) {
      throw new BadRequestException('Se requiere un id_nomina válido');
    }

    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina },
    });

    if (!nomina) {
      throw new NotFoundException('Nómina no encontrada');
    }

    if (nomina.estado === 'Cerrada') {
      throw new BadRequestException(
        'La nómina está cerrada y no se puede modificar',
      );
    }

    return true;
  }
}
