// ── Paginación ────────────────────────────────────────────────────────────────

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ── Referencias embebidas ─────────────────────────────────────────────────────

export interface ItemResumen {
  id: string;
  nombre: string;
  codigo: string;
  unidadMedida: string;
}

export interface SedeResumen {
  id: string;
  nombre: string;
}

export interface ProveedorResumen {
  id: string;
  razonSocial: string;
}

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

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TipoRequerimiento = 'GENERAL' | 'PEDIDO' | 'PRODUCCION' | 'MANTENIMIENTO';

// ── Requerimiento de material ─────────────────────────────────────────────────

export interface RequerimientoMaterial {
  id: string;
  item: ItemResumen | null;
  sede: SedeResumen | null;
  estado: EstadoResumen;
  tipoRequerimiento: TipoRequerimiento;
  cantidadRequerida: number;
  cantidadAtendida: number;
  pedidoId: string | null;
  ordenProduccionId: string | null;
  fechaNecesaria: string | null;
  observaciones: string | null;
  creadoPor: UsuarioResumen | null;
  creadoEn: string;
  actualizadoEn: string;
}

// ── Solicitud de compra ───────────────────────────────────────────────────────

export interface ItemSolicitudCompra {
  id: string;
  item: ItemResumen | null;
  cantidadSolicitada: number;
  cantidadRecibida: number;
  precioUnitario: number | null;
  requerimientoMaterialId: string | null;
  observaciones: string | null;
}

export interface SolicitudCompra {
  id: string;
  codigo: string | null;
  sede: SedeResumen | null;
  proveedor: ProveedorResumen | null;
  estado: EstadoResumen;
  observaciones: string | null;
  items: ItemSolicitudCompra[];
  creadoPor: UsuarioResumen | null;
  creadoEn: string;
  actualizadoEn: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CrearRequerimientoPayload {
  itemId: string;
  sedeId: string;
  cantidadRequerida: number;
  tipoRequerimiento?: TipoRequerimiento;
  pedidoId?: string;
  ordenProduccionId?: string;
  fechaNecesaria?: string;
  observaciones?: string;
}

export interface CambiarEstadoAbastecimientoPayload {
  estadoNuevoCodigo: string;
  observaciones?: string;
}

export interface ItemSolicitudPayload {
  itemId: string;
  cantidadSolicitada: number;
  requerimientoMaterialId?: string;
  observaciones?: string;
}

export interface CrearSolicitudCompraPayload {
  sedeId: string;
  proveedorId?: string;
  observaciones?: string;
  items: ItemSolicitudPayload[];
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface FiltrosRequerimientos {
  pagina?: number;
  limite?: number;
}

export interface FiltrosSolicitudes {
  pagina?: number;
  limite?: number;
}
