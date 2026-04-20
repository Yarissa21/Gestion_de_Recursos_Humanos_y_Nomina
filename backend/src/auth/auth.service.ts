import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async login(data: any) {
    return "login funcionando";
  }
}