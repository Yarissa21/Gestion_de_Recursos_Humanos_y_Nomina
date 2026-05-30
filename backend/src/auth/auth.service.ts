import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './auth_dto/login.dto.js';
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
    if (!dto.nombre?.trim())
      throw new BadRequestException('El nombre de usuario es obligatorio');

    if (dto.nombre.includes(' '))
      throw new BadRequestException('El nombre de usuario no puede contener espacios');

    if (!dto.password || dto.password.length < 6)
      throw new BadRequestException('La contraseña debe tener al menos 6 caracteres');

    const existente = await this.prisma.usuario.findFirst({
      where: { nombre: { equals: dto.nombre.trim(), mode: 'insensitive' } },
    });
    if (existente)
      throw new ConflictException(`Ya existe un usuario con el nombre "${dto.nombre}"`);

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const nuevoUsuario = await this.prisma.usuario.create({
      data: {
        nombre:   dto.nombre.trim(),
        password: hashedPassword,
        rol:      dto.rol ?? 'user',
      },
    });

    const { password, ...safeUsuario } = nuevoUsuario as any;
    return { message: 'Usuario registrado', usuario: safeUsuario };
  }

  async login(dto: LoginDto) {
    if (!dto.nombre?.trim())
      throw new BadRequestException('El nombre de usuario es obligatorio');

    if (!dto.password)
      throw new BadRequestException('La contraseña es obligatoria');

    const usuario = await this.prisma.usuario.findFirst({
      where: { nombre: dto.nombre.trim() },
    });
    if (!usuario)
      throw new UnauthorizedException('Usuario no encontrado');

    const isPasswordValid = await bcrypt.compare(dto.password, usuario.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Contraseña incorrecta');

    const { password, ...safeUsuario } = usuario as any;

    const payload = {
      sub:    usuario.id_usuario,
      nombre: usuario.nombre,
      rol:    usuario.rol,
    };
    const access_token = this.jwtService.sign(payload);

    return { message: 'Login válido', usuario: safeUsuario, access_token };
  }
}