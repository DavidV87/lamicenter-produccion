import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY } from '../decorators/permisos.decorador';
import { UsuarioJwt } from '../types/usuario-jwt.interfaz';

/**
 * Guard de permisos granulares.
 * Exige que el usuario tenga TODOS los permisos requeridos en su token.
 * Se omite cuando el endpoint no tiene @Permisos().
 */
@Injectable()
export class PermisosGuarda implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permisosRequeridos = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!permisosRequeridos || permisosRequeridos.length === 0) return true;

    const solicitud = context.switchToHttp().getRequest<{ user?: UsuarioJwt }>();
    const usuario = solicitud.user;
    if (!usuario) return false;

    return permisosRequeridos.every((permiso) => usuario.permisos.includes(permiso));
  }
}
