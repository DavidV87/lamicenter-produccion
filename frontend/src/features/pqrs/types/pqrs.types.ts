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
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
}

export interface TipoNovedadResumen {
  id: string;
  nombre: string;
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TipoSeguimientoPqrs =
  | 'CREACION'
  | 'ASIGNACION'
  | 'ACTUALIZACION'
  | 'SOLUCION'
  | 'CIERRE'
  | 'REAPERTURA'
  | 'ANULACION';

export type TipoEvidenciaPqrs = 'FOTO' | 'DOCUMENTO' | 'OBSERVACION';

export type RolResponsablePqrs = 'CREADOR' | 'EJECUTOR' | 'AUTORIZADOR' | 'SUPERVISOR';

// ── Entidades principales ──────────────────────────────────────────────────────

export interface SeguimientoPqrs {
  id: string;
  tipoSeguimiento: TipoSeguimientoPqrs;
  descripcion: string;
  observaciones: string | null;
  creadoPor: UsuarioResumen;
  creadoEn: string;
}

export interface EvidenciaPqrs {
  id: string;
  tipoEvidencia: TipoEvidenciaPqrs;
  rutaArchivo: string | null;
  nombreOriginal: string | null;
  descripcion: string | null;
  creadoPor: UsuarioResumen;
  creadoEn: string;
}

export interface ResponsablePqrs {
  id: string;
  usuario: UsuarioResumen;
  rolResponsable: RolResponsablePqrs;
  activo: boolean;
  fechaAsignacion: string;
  fechaFinAsignacion: string | null;
  asignadoPor: UsuarioResumen | null;
  observaciones: string | null;
}

export interface PqrsResumen {
  id: string;
  consecutivo: string;
  cliente: { id: string; razonSocial: string };
  tipoNovedad: TipoNovedadResumen;
  estadoPqrs: EstadoResumen;
  descripcion: string;
  generaReproceso: boolean;
  costoEstimado: number | null;
  creadoPor: UsuarioResumen;
  creadoEn: string;
}

export interface PqrsDetalle extends PqrsResumen {
  pedidoId: string | null;
  facturaId: string | null;
  ordenProduccionId: string | null;
  novedadOperativaId: string | null;
  solucionAplicada: string | null;
  responsableSolucion: UsuarioResumen | null;
  cerradoPor: UsuarioResumen | null;
  fechaCierre: string | null;
  metadata: Record<string, unknown> | null;
  seguimientos: SeguimientoPqrs[];
  evidencias: EvidenciaPqrs[];
  responsables: ResponsablePqrs[];
  actualizadoEn: string;
}

// ── Respuesta creación ─────────────────────────────────────────────────────────

export interface CrearPqrsRespuesta {
  pqrs: PqrsDetalle;
  advertencias: string[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CrearPqrsPayload {
  clienteId: string;
  tipoNovedadId: string;
  descripcion: string;
  pedidoId?: string;
  facturaId?: string;
  ordenProduccionId?: string;
  responsableSolucionId?: string;
  generaReproceso?: boolean;
  novedadOperativaId?: string;
  costoEstimado?: string;
  metadata?: Record<string, unknown>;
}

export interface CambiarEstadoPqrsPayload {
  estadoNuevoCodigo: string;
  observaciones?: string;
  forzar?: boolean;
}

export interface CrearSeguimientoPayload {
  tipoSeguimiento: TipoSeguimientoPqrs;
  observaciones: string;
  notasInternas?: string;
}

export interface CrearEvidenciaPqrsPayload {
  tipoEvidencia: TipoEvidenciaPqrs;
  nombreArchivo?: string;
  rutaArchivo?: string;
  observaciones?: string;
}

export interface AsignarResponsablePayload {
  usuarioId: string;
  rolResponsable: RolResponsablePqrs;
  observaciones?: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface FiltrosPqrs {
  clienteId?: string;
  estadoPqrsId?: string;
  tipoNovedadId?: string;
  pedidoId?: string;
  pagina?: number;
  limite?: number;
}
