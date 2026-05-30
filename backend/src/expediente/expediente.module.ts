import { Module } from '@nestjs/common';
import { ExpedienteService } from './expediente.service';
import { ExpedienteController } from './expediente.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Module({
  imports: [PrismaModule],
  providers: [ExpedienteService, ValidacionExpedienteService],
  controllers: [ExpedienteController],
})
export class ExpedienteModule {}