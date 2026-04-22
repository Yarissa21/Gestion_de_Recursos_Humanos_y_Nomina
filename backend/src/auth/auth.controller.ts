import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth_dto/register.dto';
import { LoginDto } from './auth_dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(@Body() dto: RegisterDto, @Req() req: any) {
    const user = req.user;

    // Anónimo: forzar rol 'user'
    if (!user) {
      dto.rol = 'user';
      return this.authService.register(dto);
    }

    // Admin: puede crear cualquier rol (si no lo especifica, por defecto 'user')
    if (user.rol === 'admin') {
      dto.rol = dto.rol ?? 'user';
      return this.authService.register(dto);
    }

    // UserRH: sólo puede registrar UserRH
    if (user.rol === 'UserRH') {
      if (dto.rol && dto.rol !== 'UserRH')
        throw new ForbiddenException('UserRH sólo puede registrar UserRH');
      dto.rol = 'UserRH';
      return this.authService.register(dto);
    }

    // Otros usuarios autenticados: no permitido
    throw new ForbiddenException('No autorizado para registrar usuarios');
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  // Ruta de prueba protegida
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('test-protegido')
  testProtegido() {
    return { mensaje: 'Acceso permitido solo para admin' };
  }
}
