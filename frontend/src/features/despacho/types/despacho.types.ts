// ── Paginación ────────────────────────────────────────────────────────────────

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ── Referencias embebidas ─────────────────────────────────────────────────────

export interface EstadoResumen {
  id: string;
  codigo: string;
  nombre: string;
  color: string | null;
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
}

export interface SedeResumen {
  id: string;
  nombre: string;
}

export interface UbicacionResumen {
  id: string;
  nombre: string;
  codigo: string;
}

export interface PedidoResumen {
  id: string;
  consecutivo: string;
  cliente: { id: string; razonSocial: string };
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TipoEvidencia = 'FOTO' | 'VIDEO' | 'DOCUMENTO' | 'FIRMA' | 'OBSERVACION';

// ── Despacho ──────────────────────────────────────────────────────────────────

export interface Despacho {
  id: string;
  pedido: PedidoResumen;
  estado: EstadoResumen;
  encargadoDespacho: UsuarioResumen | null;
  sedeSalida: SedeResumen | null;
  observaciones: string | null;
  fechaProgramada: string | null;
  autorizadoPor: UsuarioResumen | null;
  creadoEn: string;
  actualizadoEn: string;
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export interface TipoValidacionDespacho {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  ordenVisual: number;
  activo: boolean;
}

export interface ChecklistItemDespacho {
  id: string;
  tipoValidacionDespacho: { id: string; codigo: string; nombre: string };
  cumple: boolean;
  observaciones: string | null;
}

export interface ChecklistDespacho {
  id: string;
  despachoId: string;
  observaciones: string | null;
  completado: boolean;
  items: ChecklistItemDespacho[];
  creadoEn: string;
  actualizadoEn: string;
}

// ── Evidencias ────────────────────────────────────────────────────────────────

export interface EvidenciaDespacho {
  id: string;
  despachoId: string;
  tipoEvidencia: TipoEvidencia;
  nombreArchivo: string | null;
  rutaArchivo: string | null;
  observaciones: string | null;
  creadoPor: UsuarioResumen | null;
  creadoEn: string;
}

// ── Ubicación pedido ──────────────────────────────────────────────────────────

export interface HistorialUbicacion {
  id: string;
  sede: SedeResumen;
  ubicacion: UbicacionResumen | null;
  observaciones: string | null;
  creadoPor: UsuarioResumen | null;
  creadoEn: string;
}

export interface UbicacionPedido {
  pedidoId: string;
  sedeActual: SedeResumen | null;
  ubicacionActual: UbicacionResumen | null;
  observaciones: string | null;
  actualizadoEn: string | null;
  historial: HistorialUbicacion[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CrearDespachoPayload {
  pedidoId: string;
  sedeSalidaId: string;
  encargadoDespachoId?: string;
  fechaProgramada?: string;
  observaciones?: string;
}

export interface CambiarEstadoDespachoPayload {
  estadoNuevoCodigo: string;
  observaciones?: string;
  forzar?: boolean;
}

export interface ChecklistItemPayload {
  tipoValidacionDespachoId: string;
  cumple: boolean;
  observaciones?: string;
}

export interface CrearChecklistPayload {
  observaciones?: string;
  items: ChecklistItemPayload[];
}

export interface CrearEvidenciaPayload {
  tipoEvidencia: TipoEvidencia;
  nombreArchivo?: string;
  rutaArchivo?: string;
  observaciones?: string;
}

export interface ActualizarUbicacionPayload {
  sedeId: string;
  ubicacionId?: string;
  observaciones?: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface FiltrosDespachos {
  pedidoId?: string;
  estadoDespachoId?: string;
  encargadoDespachoId?: string;
  sedeSalidaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  limite?: number;
}
