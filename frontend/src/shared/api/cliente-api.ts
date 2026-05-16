import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { RespuestaApi } from '@/shared/types';

const API_URL = import.meta.env.VITE_API_URL as string;

export const clienteApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Acceso a tokens desde localStorage ───────────────────────────────────────
// Lee directamente para evitar dependencia circular con el auth store.
// Clave fija 'auth-storage' configurada en useAuthStore (Zustand persist).

function obtenerTokens() {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string; refreshToken?: string };
    };
    return {
      accessToken:  parsed.state?.accessToken  ?? null,
      refreshToken: parsed.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

// Actualiza ambos tokens en localStorage tras un refresh exitoso.
// POST /auth/refresh devuelve { exito, datos: { accessToken, refreshToken } }
// — el backend siempre rota el refreshToken.
function actualizarTokensEnStorage(accessToken: string, refreshToken: string) {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
    if (parsed.state) {
      parsed.state.accessToken  = accessToken;
      parsed.state.refreshToken = refreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch {
    // ignorar errores de JSON/localStorage
  }
}

function limpiarSesion() {
  localStorage.removeItem('auth-storage');
  window.location.href = '/login';
}

// ── Anti-loop: flag + cola ────────────────────────────────────────────────────
let refrescando = false;
let colaEspera: Array<(token: string) => void> = [];

// ── Interceptor de request ────────────────────────────────────────────────────

clienteApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = obtenerTokens();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Interceptor de response — refresh automático ──────────────────────────────
// Respuesta real de /auth/refresh (verificada contra el backend):
//   { exito: true, mensaje: "Tokens renovados", datos: { accessToken, refreshToken } }
// El backend rota ambos tokens en cada refresh.

clienteApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _reintentado?: boolean };

    // Solo actuar ante 401; salir si ya se reintentó o si el error ES del refresh
    if (
      error.response?.status !== 401 ||
      config._reintentado ||
      config.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    config._reintentado = true;

    if (refrescando) {
      // Encolar mientras el refresh en curso termina
      return new Promise((resolve, reject) => {
        colaEspera.push((nuevoToken) => {
          config.headers.Authorization = `Bearer ${nuevoToken}`;
          resolve(clienteApi(config));
        });
        setTimeout(() => reject(error), 10_000);
      });
    }

    refrescando = true;

    try {
      const { refreshToken } = obtenerTokens();
      if (!refreshToken) throw new Error('sin refresh token');

      // Llamada directa con axios (no con clienteApi) para evitar loop
      const { data } = await axios.post<RespuestaApi<{ accessToken: string; refreshToken: string }>>(
        `${API_URL}/auth/refresh`,
        { refreshToken },
      );

      if (!data.exito || !data.datos?.accessToken || !data.datos?.refreshToken) {
        throw new Error('refresh inválido');
      }

      const { accessToken: nuevoAccess, refreshToken: nuevoRefresh } = data.datos;

      // Persiste ambos tokens rotados
      actualizarTokensEnStorage(nuevoAccess, nuevoRefresh);

      // Desbloquear cola de peticiones que esperaban
      colaEspera.forEach((cb) => cb(nuevoAccess));
      colaEspera = [];

      config.headers.Authorization = `Bearer ${nuevoAccess}`;
      return clienteApi(config);
    } catch {
      colaEspera = [];
      limpiarSesion();
      return Promise.reject(error);
    } finally {
      refrescando = false;
    }
  },
);
