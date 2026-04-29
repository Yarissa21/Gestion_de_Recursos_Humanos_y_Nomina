import { Module } from '@nestjs/common';
import { TipoDocumentoAcademicoService } from './tipo_documento_academico.service';
import { TipoDocumentoAcademicoController } from './tipo_documento_academico.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TipoDocumentoAcademicoController],
  providers: [TipoDocumentoAcademicoService],
})
export class TipoDocumentoAcademicoModule {}