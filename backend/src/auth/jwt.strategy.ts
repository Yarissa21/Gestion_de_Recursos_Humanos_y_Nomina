import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'changeMe',
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.usuario.findUnique({ where: { id_usuario: payload.sub } });
    if (!user) return null;
    const { password, ...safe } = user as any;
    return safe;
  }
}
