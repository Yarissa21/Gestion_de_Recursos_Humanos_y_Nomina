import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth_dto/register.dto';
import { LoginDto } from './auth_dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o contraseña muy corta' })
  @ApiResponse({ status: 409, description: 'Ya existe un usuario con ese nombre' })
  @ApiResponse({ status: 403, description: 'No autorizado para registrar con ese rol' })
  @Post('register')
  @UseGuards(OptionalJwtAuthGuard)
  register(@Body() dto: RegisterDto, @Req() req: any) {
    const user = req.user;

    if (!user) {
      dto.rol = 'user';
      return this.authService.register(dto);
    }

    if (user.rol === 'admin') {
      dto.rol = dto.rol ?? 'user';
      return this.authService.register(dto);
    }

    if (user.rol === 'UserRH') {
      if (dto.rol && dto.rol !== 'UserRH')
        throw new ForbiddenException('UserRH sólo puede registrar UserRH');
      dto.rol = 'UserRH';
      return this.authService.register(dto);
    }

    throw new ForbiddenException('No autorizado para registrar usuarios');
  }

  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Login exitoso, retorna token JWT y datos del usuario' })
  @ApiResponse({ status: 400, description: 'Campos obligatorios faltantes' })
  @ApiResponse({ status: 401, description: 'Usuario no encontrado o contraseña incorrecta' })
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @ApiOperation({ summary: 'Ruta de prueba protegida (solo admin)' })
  @ApiResponse({ status: 200, description: 'Acceso permitido' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('test-protegido')
  testProtegido() {
    return { mensaje: 'Acceso permitido solo para admin' };
  }
}