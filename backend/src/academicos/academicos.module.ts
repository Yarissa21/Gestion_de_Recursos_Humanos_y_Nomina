import { Module } from '@nestjs/common';
import { AcademicosService } from './academicos.service';
import { AcademicosController } from './academicos.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Module({
  imports: [PrismaModule],
  providers: [AcademicosService, ValidacionExpedienteService],
  controllers: [AcademicosController],
})
export class AcademicosModule {}