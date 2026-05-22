import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private prisma: PrismaService) {}

  async contarUsuarios() {
    return this.prisma.usuario.count({
 
    });
  }

  async listarUsuarios() {
    return this.prisma.usuario.findMany({
      select: {
        id_usuario: true,
        nombre: true,
        rol: true,
        id_empleado: true,
      },
    });
  }

  async vincularEmpleado(id_usuario: number, id_empleado: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const empleado = await this.prisma.empleado.findUnique({ where: { id_empleado } });
    if (!empleado || empleado.eliminado) throw new NotFoundException('Empleado no encontrado');

    const yaVinculado = await this.prisma.usuario.findFirst({
      where: { id_empleado, NOT: { id_usuario } },
    });
    if (yaVinculado) throw new BadRequestException('Este empleado ya está vinculado a otro usuario');

    return this.prisma.usuario.update({
      where: { id_usuario },
      data: { id_empleado },
      select: { id_usuario: true, nombre: true, rol: true, id_empleado: true },
    });
  }

  async desvincularEmpleado(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id_usuario } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!usuario.id_empleado) throw new BadRequestException('Este usuario no tiene empleado vinculado');

    return this.prisma.usuario.update({
      where: { id_usuario },
      data: { id_empleado: null },
      select: { id_usuario: true, nombre: true, rol: true, id_empleado: true },
    });
  }

  async obtenerEmpleadoDeUsuario(id_usuario: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usuario },
      include: { empleado: true },
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    if (!usuario.empleado) throw new NotFoundException('Este usuario no tiene empleado vinculado');
    return usuario.empleado;
  }
}
