import { Injectable } from '@nestjs/common';
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
      },
    });
  }
}
