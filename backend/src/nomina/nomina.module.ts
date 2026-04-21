import { Module } from '@nestjs/common';
import { NominaService } from './nomina.service';
import { NominaController } from './nomina.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NominaService],
  controllers: [NominaController]
})
export class NominaModule {}
