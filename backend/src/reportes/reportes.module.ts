import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesService } from './reportes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportesController],
  providers: [ReportesService, ValidacionExpedienteService],
})
export class ReportesModule {}