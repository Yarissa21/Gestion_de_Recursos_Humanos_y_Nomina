import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ValidacionExpedienteService } from './validacion-expediente.service';

@Controller('validacion-expediente')
export class ValidacionExpedienteController {
  constructor(private readonly service: ValidacionExpedienteService) {}

  @Get()
  validarTodos() {
    return this.service.validarTodos();
  }

  @Get('resumen')
  resumenTodos() {
    return this.service.resumenTodos();
  }

  @Get('guardadas')
  obtenerGuardadas() {
    return this.service.obtenerValidacionesGuardadas();
  }

  @Get(':id_empleado')
  validarUno(@Param('id_empleado', ParseIntPipe) id: number) {
    return this.service.validarEmpleado(id);
  }
}