import { Controller, Get } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('api/usuarios')
export class UsuariosController {
  constructor(private usuariosService: UsuariosService) {}

  @Get()
  async contar() {
    return { total: await this.usuariosService.contarUsuarios() };
  }

  @Get('lista')
  async listar() {
    return this.usuariosService.listarUsuarios();
  }
}
