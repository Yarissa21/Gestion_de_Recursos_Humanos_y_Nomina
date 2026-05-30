import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProduces } from '@nestjs/swagger';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Reportes PDF')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reportes')
export class ReportesController {
  constructor(private readonly service: ReportesService) {}

  // ============================
  // NÓMINAS
  // ============================

  @ApiOperation({ summary: 'Reporte general de todas las nóminas (PDF landscape)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @Roles('admin', 'UserRH')
  @Get('nominas')
  async reporteNominas(@Res() res: any) {
    return this.service.generarReporteNominas(res);
  }

  @ApiOperation({ summary: 'Reporte de nómina específica con tabla SAT (PDF landscape)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @ApiResponse({ status: 404, description: 'Nómina no encontrada' })
  @Roles('admin', 'UserRH')
  @Get('nominas/:id')
  async reporteNominaPorId(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteNominaPorId(id, res);
  }

  @ApiOperation({ summary: 'Historial de boletas de un empleado — una boleta por nómina (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('nominas/empleado/:id')
  async reporteNominasPorEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteNominasPorEmpleado(id, res);
  }

  @ApiOperation({ summary: 'Baucher individual de empleado en nómina específica (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @ApiResponse({ status: 404, description: 'Nómina o empleado no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('nominas/:nominaId/empleado/:empleadoId')
  async reporteDetalleEmpleadoEnNomina(
    @Param('nominaId', ParseIntPipe) nominaId: number,
    @Param('empleadoId', ParseIntPipe) empleadoId: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteDetalleEmpleadoEnNomina(nominaId, empleadoId, res);
  }

  // ============================
  // EXPEDIENTES
  // ============================

  @ApiOperation({ summary: 'Reporte general de expedientes de todos los empleados (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @Roles('admin', 'UserRH')
  @Get('expedientes')
  async reporteExpedientes(@Res() res: any) {
    return this.service.generarReporteExpedientes(res);
  }

  @ApiOperation({ summary: 'Reporte de expediente de un empleado específico (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('expedientes/:id')
  async reporteExpedienteEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteExpedienteEmpleado(id, res);
  }

  // ============================
  // ACADÉMICOS
  // ============================

  @ApiOperation({ summary: 'Reporte general de información académica de todos los empleados (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @Roles('admin', 'UserRH')
  @Get('academicos')
  async reporteAcademicos(@Res() res: any) {
    return this.service.generarReporteAcademicos(res);
  }

  @ApiOperation({ summary: 'Reporte académico de un empleado específico (PDF)' })
  @ApiProduces('application/pdf')
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  @ApiResponse({ status: 404, description: 'Empleado no encontrado' })
  @Roles('admin', 'UserRH', 'user')
  @Get('academicos/:id')
  async reporteAcademicoEmpleado(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: any,
  ) {
    return this.service.generarReporteAcademicoEmpleado(id, res);
  }
}