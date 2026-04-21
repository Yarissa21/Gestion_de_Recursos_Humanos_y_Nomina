import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { EmpleadosModule } from './empleados/empleados.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { NominaModule } from './nomina/nomina.module';

@Module({
  imports: [PrismaModule, EmpleadosModule, DepartamentosModule, NominaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
