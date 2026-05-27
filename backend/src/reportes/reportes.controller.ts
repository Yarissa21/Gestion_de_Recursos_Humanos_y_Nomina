import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';

import { ReportesService } from './reportes.service';

@Controller('reportes')
export class ReportesController {
  constructor(
    private readonly service: ReportesService,
  ) {}

  // ============================
  // NÓMINAS
  // ============================

  @Get('nominas')
  async reporteNominas(@Res() res: any) {
    return this.service.generarReporteNominas(
      res,
    );
  }

  @Get('nominas/:id')
  async reporteNominaPorId(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteNominaPorId(
      id,
      res,
    );
  }

  @Get('nominas/empleado/:id')
  async reporteNominasPorEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteNominasPorEmpleado(id, res);
  }
 
  @Get('nominas/:nominaId/empleado/:empleadoId')
  async reporteDetalleEmpleadoEnNomina(
    @Param('nominaId', ParseIntPipe) nominaId: number,
    @Param('empleadoId', ParseIntPipe) empleadoId: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteDetalleEmpleadoEnNomina(
      nominaId,
      empleadoId,
      res,
    );
  }

  // ============================
  // EXPEDIENTES
  // ============================

  @Get('expedientes')
  async reporteExpedientes(@Res() res: any) {
    return this.service.generarReporteExpedientes(
      res,
    );
  }

  @Get('expedientes/:id')
  async reporteExpedienteEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteExpedienteEmpleado(
      id,
      res,
    );
  }

  // ============================
  // ACADÉMICOS
  // ============================

  @Get('academicos')
  async reporteAcademicos(@Res() res: any) {
    return this.service.generarReporteAcademicos(
      res,
    );
  }

  @Get('academicos/:id')
  async reporteAcademicoEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteAcademicoEmpleado(
      id,
      res,
    );
  }
}