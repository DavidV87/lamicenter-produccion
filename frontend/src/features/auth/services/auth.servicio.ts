import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi, AuthResponse } from '@/shared/types';

interface CredencialesLogin {
  email: string;
  password: string;
}

// Shape real que devuelve el backend en datos:
// { accessToken, refreshToken, usuario: { id, nombre, email, rolId, rol, sedeId, permisos[] } }
// Los permisos viven dentro de usuario, no en el nivel raíz de datos.
interface RespuestaLogin {
  accessToken:  string;
  refreshToken: string;
  usuario: {
    id:       string;
    nombre:   string;
    email:    string;
    rolId:    string;
    rol:      string;
    sedeId:   string;
    permisos: string[];
  };
}

export const authServicio = {
  async login(credenciales: CredencialesLogin): Promise<AuthResponse> {
    const { data } = await clienteApi.post<RespuestaApi<RespuestaLogin>>(
      '/auth/login',
      credenciales,
    );
    if (!data.exito || !data.datos) {
      throw new Error(data.mensaje ?? 'Error al iniciar sesión');
    }
    // Normalizar: devolver usuario con permisos en su interior
    const { accessToken, refreshToken, usuario } = data.datos;
    return { accessToken, refreshToken, usuario };
  },
};
