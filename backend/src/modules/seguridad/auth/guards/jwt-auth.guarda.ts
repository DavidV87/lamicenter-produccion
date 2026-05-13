import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ES_PUBLICO_KEY } from '../../../../common/decorators/publico.decorator';

/**
 * Guard global de autenticación JWT.
 * Omite la verificación cuando el endpoint está marcado con @Publico().
 * Se registra globalmente vía APP_GUARD en AplicacionModulo.
 */
@Injectable()
export class JwtAuthGuarda extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const esPublico = this.reflector.getAllAndOverride<boolean>(ES_PUBLICO_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (esPublico) return true;
    return super.canActivate(context);
  }
}
