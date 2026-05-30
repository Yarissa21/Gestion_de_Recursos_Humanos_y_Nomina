import { Module } from '@nestjs/common';
import { NominaService } from './nomina.service';
import { NominaController } from './nomina.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NominaEditableGuard } from './nomina-editable.guard';

@Module({
  imports: [PrismaModule],
  providers: [NominaService, NominaEditableGuard],
  controllers: [NominaController],
})
export class NominaModule {}