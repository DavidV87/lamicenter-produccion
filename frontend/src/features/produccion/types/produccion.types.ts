// ── Paginación ────────────────────────────────────────────────────────────────

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export type TipoEvento =
  | 'INICIO_ETAPA'
  | 'FIN_ETAPA'
  | 'NOVEDAD'
  | 'REPROCESO'
  | 'CAMBIO_PRIORIDAD'
  | 'ASIGNACION_MAQUINA'
  | 'AUTORIZACION'
  | 'PAUSA';

// ── Referencias embebidas ─────────────────────────────────────────────────────

export interface EstadoResumen {
  id: string;
  codigo: string;
  nombre: string;
  color: string | null;
}

export interface SedeResumen {
  id: string;
  nombre: string;
  codigo: string;
}

export interface MaquinaResumen {
  id: string;
  nombre: string;
  codigo: string;
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
}

export interface PedidoResumen {
  id: string;
  consecutivo: string;
}

// ── Asignación de etapa ───────────────────────────────────────────────────────

export interface AsignacionEtapa {
  id: string;
  operador: UsuarioResumen | null;
  maquina: MaquinaResumen | null;
  fechaInicioAsignacion: string | null;
  activo: boolean;
  creadoEn: string;
}

// ── Etapa de orden ────────────────────────────────────────────────────────────

export interface EtapaOrden {
  id: string;
  etapaProduccionId: string | null;
  nombreEtapa: string | null;
  estado: EstadoResumen;
  asignacionActual: AsignacionEtapa | null;
  observaciones: string | null;
  creadoEn: string;
}

// ── Evento operativo ──────────────────────────────────────────────────────────

export interface EventoOperativo {
  id: string;
  tipoEvento: TipoEvento;
  descripcion: string;
  fechaEvento: string | null;
  metadata: Record<string, unknown> | null;
  usuario: UsuarioResumen | null;
  creadoEn: string;
}

// ── Orden de producción ───────────────────────────────────────────────────────

export interface OrdenProduccion {
  id: string;
  consecutivo: string;
  pedido: PedidoResumen;
  estado: EstadoResumen;
  sedeProduccion: SedeResumen | null;
  sedeActual: SedeResumen | null;
  sedeDespacho: SedeResumen | null;
  maquinaPrincipal: MaquinaResumen | null;
  ordenPrioridad: number;
  fechaInicioPlaneada: string | null;
  fechaFinPlaneada: string | null;
  fechaInicioReal: string | null;
  fechaFinReal: string | null;
  observaciones: string | null;
  etapas: EtapaOrden[];
  creadoEn: string;
  actualizadoEn: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CrearOrdenProduccionPayload {
  pedidoId: string;
  sedeProduccionId: string;
  sedeActualId: string;
  sedeDespachoId?: string;
  maquinaPrincipalId?: string;
  ordenPrioridad?: number;
  fechaInicioPlaneada?: string;
  fechaFinPlaneada?: string;
  observaciones?: string;
}

export interface CambiarEstadoOrdenPayload {
  estadoNuevoCodigo: string;
  observaciones?: string;
  forzar?: boolean;
}

export interface CrearEtapaPayload {
  etapaProduccionId: string;
  estadoEtapaCodigo?: string;
  observaciones?: string;
}

export interface AsignarEtapaPayload {
  operadorId: string;
  maquinaId?: string;
  fechaInicioAsignacion?: string;
  motivo?: string;
  observaciones?: string;
}

export interface CrearEventoOperativoPayload {
  ordenProduccionId: string;
  tipoEvento: TipoEvento;
  descripcion: string;
  fechaEvento?: string;
}

// ── Filtros ───────────────────────────────────────────────────────────────────

export interface FiltrosOrdenesProduccion {
  estadoOrdenId?: string;
  busqueda?: string;
  pagina?: number;
  limite?: number;
}
