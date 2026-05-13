/**
 * Estructura del payload decodificado del JWT de acceso.
 * Es lo que Passport coloca en req.user después de validar el token.
 */
export interface UsuarioJwt {
  sub: string;
  email: string;
  nombre: string;
  rolId: string;
  rol: string;
  sedeId: string;
  permisos: string[];
}
