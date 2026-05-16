import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UsuarioActual } from '@/shared/types';

interface EstadoAuth {
  usuario:      UsuarioActual | null;
  accessToken:  string | null;
  refreshToken: string | null;
  setAuth: (payload: {
    usuario:      UsuarioActual;
    accessToken:  string;
    refreshToken: string;
  }) => void;
  cerrarSesion:  () => void;
  tienePermiso:  (permiso: string) => boolean;
}

export const useAuthStore = create<EstadoAuth>()(
  persist(
    (set, get) => ({
      usuario:      null,
      accessToken:  null,
      refreshToken: null,

      setAuth: ({ usuario, accessToken, refreshToken }) =>
        set({ usuario, accessToken, refreshToken }),

      cerrarSesion: () =>
        set({ usuario: null, accessToken: null, refreshToken: null }),

      // Permisos viven en usuario.permisos (estructura real del backend)
      tienePermiso: (permiso) =>
        get().usuario?.permisos.includes(permiso) ?? false,
    }),
    { name: 'auth-storage' },
  ),
);
