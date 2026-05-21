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
    const id_nomina = await this.resolverIdNomina(request);

    if (!id_nomina) {
      throw new BadRequestException('No se pudo resolver el id_nomina');
    }

    const nomina = await this.prisma.nomina.findUnique({ where: { id_nomina } });
    if (!nomina) throw new NotFoundException('Nómina no encontrada');

    if (nomina.estado === 'Cerrada') {
      throw new BadRequestException(
        'La nómina está cerrada y no se puede modificar',
      );
    }

    return true;
  }

  private async resolverIdNomina(request: any): Promise<number | null> {

    if (request.route.path.includes(':id/recalcular') || request.route.path.includes(':id/estado') || request.route.path === '/nomina/:id') {
      return Number(request.params.id);
    }

    if (request.route.path.includes('detalles')) {
      const detalle = await this.prisma.detalleNomina.findUnique({
        where: { id_detalle: Number(request.params.id) },
      });
      return detalle?.id_nomina ?? null;
    }

    if (request.route.path.includes('conceptos')) {
      const detalleConcepto = await this.prisma.detalleConceptoNomina.findUnique({
        where: { id_detalle_concepto: Number(request.params.id) },
        include: { detalle: true },
      });
      return detalleConcepto?.detalle?.id_nomina ?? null;
    }

    return null;
  }
}