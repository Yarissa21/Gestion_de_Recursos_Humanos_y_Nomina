import { Module } from '@nestjs/common';
import { ConceptoNominaService } from './concepto-nomina.service';
import { ConceptoNominaController } from './concepto-nomina.controller';
import { PrismaModule } from '../prisma/prisma.module';


@Module({
  imports: [PrismaModule],
  providers: [ConceptoNominaService],
  controllers: [ConceptoNominaController]
})
export class ConceptoNominaModule {}
