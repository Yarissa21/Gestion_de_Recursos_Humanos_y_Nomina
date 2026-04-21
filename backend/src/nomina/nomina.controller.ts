import { Controller, Post, Body } from '@nestjs/common';
import { NominaService } from './nomina.service';
import { CreateNominaDto } from './dto/create-nomina.dto';

@Controller('nomina')
export class NominaController {
  constructor(private readonly nominaService: NominaService) {}

  @Post()
  async crear(@Body() dto: CreateNominaDto) {
    return this.nominaService.crearNomina(dto);
  }
}
