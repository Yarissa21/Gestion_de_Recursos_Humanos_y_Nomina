import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './auth_dto/login.dto';
import { RegisterDto } from './auth_dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        password: hashedPassword,
        rol: dto.rol ?? 'user',
      },
    });

    const { password, ...safeUsuario } = nuevoUsuario as any;
    return { message: 'Usuario registrado', usuario: safeUsuario };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findFirst({
      where: { nombre: dto.nombre },
    });
    if (!usuario) throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      usuario.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Contraseña incorrecta');

    const { password, ...safeUsuario } = usuario as any;

    const payload = {
      sub: usuario.id_usuario,
      nombre: usuario.nombre,
      rol: usuario.rol,
    };
    const access_token = this.jwtService.sign(payload);

    return { message: 'Login válido', usuario: safeUsuario, access_token };
  }
}
