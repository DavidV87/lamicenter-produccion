import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuarioJwt } from '../types/usuario-jwt.interfaz';

@Injectable()
export class JwtEstrategia extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('aplicacion.jwt.accessSecret') ??
        'secreto_acceso_no_configurado_cambiar',
    });
  }

  /**
   * Retorna el payload tal como está — se coloca en req.user.
   * La firma del token ya fue verificada por Passport antes de llegar aquí.
   */
  async validate(payload: UsuarioJwt): Promise<UsuarioJwt> {
    return payload;
  }
}
