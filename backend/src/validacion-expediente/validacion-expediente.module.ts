import { Module } from '@nestjs/common';
import { ValidacionExpedienteService } from './validacion-expediente.service';
import { ValidacionExpedienteController } from './validacion-expediente.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ValidacionExpedienteService],
  controllers: [ValidacionExpedienteController],
})
export class ValidacionExpedienteModule {}