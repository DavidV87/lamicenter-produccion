import { Controller, Get } from '@nestjs/common';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { Permisos } from './auth/decorators/permisos.decorador';
import { AuthServicio } from './auth/auth.servicio';

type UsuarioResumen = {
  id: string;
  nombre: string;
  email: string;
  rolId: string;
  rol: { nombre: string };
  sedeId: string;
};

@Controller('seguridad')
export class SeguridadControlador {
  constructor(private readonly authServicio: AuthServicio) {}

  /** Lista todos los usuarios activos. Uso: selects en módulos de producción, pedidos, etc. */
  @Get('usuarios')
  @Permisos('seguridad.ver')
  async listarUsuarios(): Promise<RespuestaApi<UsuarioResumen[]>> {
    const usuarios = await this.authServicio.listarUsuariosActivos();
    return respuestaExitosa(usuarios, 'Usuarios obtenidos');
  }
}
