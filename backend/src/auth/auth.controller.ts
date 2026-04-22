import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth_dto/register.dto';
import { LoginDto } from './auth_dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
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
