import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorador';
import { UsuarioJwt } from '../types/usuario-jwt.interfaz';

/**
 * Guard de roles.
 * Permite el acceso si el usuario tiene al menos uno de los roles requeridos.
 * Se omite cuando el endpoint no tiene @Roles().
 */
@Injectable()
export class RolesGuarda implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!rolesRequeridos || rolesRequeridos.length === 0) return true;

    const solicitud = context.switchToHttp().getRequest<{ user?: UsuarioJwt }>();
    const usuario = solicitud.user;
    if (!usuario) return false;

    return rolesRequeridos.includes(usuario.rol);
  }
}
