import { Module } from '@nestjs/common';
import { PuestoTrabajoService } from './puesto-trabajo.service';
import { PuestoTrabajoController } from './puesto-trabajo.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PuestoTrabajoService],
  controllers: [PuestoTrabajoController]
})
export class PuestoTrabajoModule {}
