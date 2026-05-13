import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioJwt } from '../types/usuario-jwt.interfaz';

/** Inyecta el usuario autenticado desde req.user en el parámetro del controlador. */
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioJwt => {
    const solicitud = ctx.switchToHttp().getRequest<{ user: UsuarioJwt }>();
    return solicitud.user;
  },
);
