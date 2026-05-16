// =============================================================
// Interfaces de respuesta del módulo ReportesModule
// Todas son read-only; ningún campo debe exponer passwordHash ni tokens.
// =============================================================

// ── Dashboard ──────────────────────────────────────────────────────────────

export interface ResumenPedidosDashboard {
  total: number;
  /** Estados: borrador, en_revision, validado */
  pendientes: number;
  /** Estados: en_produccion, listo_despacho, despachado */
  enProceso: number;
  /** Estado: completado */
  completados: number;
}

export interface ResumenProduccionDashboard {
  /** Órdenes no en estado terminada ni cancelada */
  ordenesActivas: number;
  /** Etapas en estado pendiente, en_proceso o pausada */
  etapasActivas: number;
}

export interface ResumenAbastecimientoDashboard {
  /** Requerimientos en estado pendiente, en_revision o aprobado */
  requerimientosPendientes: number;
  /** Solicitudes de compra en estado borrador, en_revision o aprobada */
  solicitudesActivas: number;
}

export interface ResumenDespachoDashboard {
  /** Despachos en estado pendiente, autorizado o en_cargue */
  pendientes: number;
  /** Despachos en estado despachado o entregado creados hoy */
  despachadosHoy: number;
}

export interface ResumenPqrsDashboard {
  /** Estado: abierta */
  abiertas: number;
  /** Estado: cerrada */
  cerradas: number;
  /** Estados: en_revision, en_solucion, solucion_aplicada */
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

// ── Actividad reciente ─────────────────────────────────────────────────────

export type TipoActividadReciente = 'pedido' | 'pqrs' | 'despacho' | 'produccion';

export interface ActividadRecienteItem {
  tipo: TipoActividadReciente;
  descripcion: string;
  fecha: Date;
  usuario: string | null;
  entidadId: string;
}

// ── Pedidos ────────────────────────────────────────────────────────────────

export interface PedidosPorEstado {
  estadoId: string;
  estado: string;
  codigo: string;
  cantidad: number;
}

export interface PedidosPorSede {
  sedeId: string;
  sede: string;
  cantidad: number;
}

export interface TiemposPedidoResultado {
  /** Promedio en horas desde creadoEn hasta fechaDespachoCompleto */
  promedioHorasTotalCiclo: number | null;
  /** Cantidad de pedidos que tenían fechaDespachoCompleto — base del promedio */
  totalConFechaCompleta: number;
}

// ── Producción ─────────────────────────────────────────────────────────────

export interface ProduccionPorEstado {
  estadoId: string;
  estado: string;
  codigo: string;
  cantidad: number;
}

export interface OrdenActivaResumen {
  id: string;
  pedidoId: string;
  estado: string;
  codigoEstado: string;
  sedeProduccion: string;
  fechaInicioReal: Date | null;
  creadoEn: Date;
}

export interface EventoRecienteResumen {
  id: string;
  tipoEvento: string;
  ordenProduccionId: string | null;
  subordenId: string | null;
  descripcion: string;
  registradoPor: string;
  fechaEvento: Date;
}

// ── Abastecimiento ─────────────────────────────────────────────────────────

export interface RequerimientoPendienteResumen {
  id: string;
  item: string;
  sede: string;
  tipoRequerimiento: string;
  estado: string;
  cantidadRequerida: number;
  fechaRequerida: Date | null;
  creadoEn: Date;
}

export interface SolicitudActivaResumen {
  id: string;
  codigo: string;
  sede: string;
  estado: string;
  proveedor: string | null;
  fechaSolicitud: Date;
  creadoEn: Date;
}

// ── Despacho ───────────────────────────────────────────────────────────────

export interface DespachoPorEstado {
  estadoId: string;
  estado: string;
  codigo: string;
  cantidad: number;
}

export interface DespachoPendienteResumen {
  id: string;
  pedidoId: string;
  sede: string;
  estado: string;
  fechaDespacho: Date;
  creadoEn: Date;
}

// ── PQRS ───────────────────────────────────────────────────────────────────

export interface PqrsPorTipo {
  tipoNovedadId: string;
  tipo: string;
  cantidad: number;
}

export interface PqrsResumenMetrica {
  total: number;
  abiertas: number;
  enRevision: number;
  cerradas: number;
  anuladas: number;
  porTipo: PqrsPorTipo[];
}

export interface PqrsAbiertaResumen {
  id: string;
  consecutivo: string;
  cliente: string;
  tipo: string;
  estado: string;
  /** Días transcurridos desde creadoEn hasta hoy */
  diasAbierta: number;
  creadoEn: Date;
}

// ── Auditoría ──────────────────────────────────────────────────────────────

export interface AuditoriaActividadResumen {
  id: string;
  tablaAfectada: string;
  registroId: string;
  accion: string;
  usuario: string | null;
  creadoEn: Date;
}
