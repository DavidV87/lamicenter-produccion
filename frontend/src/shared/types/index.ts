// ── Envelope API ──────────────────────────────────────────────────────────────

export interface RespuestaApi<T> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  errores?: string[];
  marca?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export interface UsuarioActual {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  rolId: string;
  sedeId: string;
  permisos: string[];
}

// El backend devuelve permisos dentro de usuario, no en el nivel raíz de datos
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioActual;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface ResumenPedidosDashboard {
  total: number;
  pendientes: number;
  enProceso: number;
  completados: number;
}

export interface ResumenProduccionDashboard {
  ordenesActivas: number;
  etapasActivas: number;
}

export interface ResumenAbastecimientoDashboard {
  requerimientosPendientes: number;
  solicitudesActivas: number;
}

export interface ResumenDespachoDashboard {
  pendientes: number;
  despachadosHoy: number;
}

export interface ResumenPqrsDashboard {
  abiertas: number;
  cerradas: number;
  enRevision: number;
}

export interface ResumenGeneralDashboard {
  pedidos: ResumenPedidosDashboard;
  produccion: ResumenProduccionDashboard;
  abastecimiento: ResumenAbastecimientoDashboard;
  despacho: ResumenDespachoDashboard;
  pqrs: ResumenPqrsDashboard;
  generadoEn: string;
}

export type TipoActividad = 'pedido' | 'pqrs' | 'despacho' | 'produccion';

export interface ActividadReciente {
  tipo: TipoActividad;
  descripcion: string;
  fecha: string;
  usuario: string | null;
  entidadId: string;
}
