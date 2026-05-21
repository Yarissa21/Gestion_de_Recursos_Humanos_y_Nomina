import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ValidacionExpedienteService } from './validacion-expediente.service';

@Controller('validacion-expediente')
export class ValidacionExpedienteController {
  constructor(private readonly service: ValidacionExpedienteService) {}

  @Get(':id_empleado')
  validarUno(@Param('id_empleado', ParseIntPipe) id: number) {
    return this.service.validarEmpleado(id);
  }

  @Get()
  validarTodos() {
    return this.service.validarTodos();
  }
}