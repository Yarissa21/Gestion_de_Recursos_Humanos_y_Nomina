import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { AuthModule } from './auth/auth.module';
import { AcademicosModule } from './academicos/academicos.module';
import { NominaModule } from './nomina/nomina.module';
import { ConceptoNominaModule } from './concepto-nomina/concepto-nomina.module';
import { TipoDocumentoAcademicoModule } from './tipo_documento_academico/tipo_documento_academico.module';

@Module({
  imports: [
    PrismaModule,
    EmpleadosModule,
    DepartamentosModule,
    AuthModule,
    AcademicosModule,
    NominaModule,
    ConceptoNominaModule,
    TipoDocumentoAcademicoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
