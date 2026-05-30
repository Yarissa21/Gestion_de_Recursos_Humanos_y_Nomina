import { Module } from '@nestjs/common';
import { TipoDocumentoAcademicoService } from './tipo_documento_academico.service';
import { TipoDocumentoAcademicoController } from './tipo_documento_academico.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ValidacionExpedienteService } from '../validacion-expediente/validacion-expediente.service';

@Module({
  imports: [PrismaModule],
  controllers: [TipoDocumentoAcademicoController],
  providers: [TipoDocumentoAcademicoService, ValidacionExpedienteService],
})
export class TipoDocumentoAcademicoModule {}