import { Module } from '@nestjs/common';
import { AcademicosService } from './academicos.service';
import { AcademicosController } from './academicos.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AcademicosService],
  controllers: [AcademicosController],
})
export class AcademicosModule {}
