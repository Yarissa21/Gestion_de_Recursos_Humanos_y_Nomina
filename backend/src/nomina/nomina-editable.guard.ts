import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NominaEditableGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const id_nomina =
      parseInt(request.params.id, 10) ||
      parseInt(request.body.id_nomina, 10);

    if (!id_nomina) {
      return true;
    }

    const nomina = await this.prisma.nomina.findUnique({
      where: { id_nomina },
    });

    if (!nomina) {
      throw new BadRequestException('Nómina no encontrada');
    }

    if (nomina.estado === 'Cerrada') {
      throw new BadRequestException(
        'La nómina está cerrada y no se puede modificar',
      );
    }

    return true;
  }
}
