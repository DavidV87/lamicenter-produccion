// ── Paginación compartida ─────────────────────────────────────────────────────

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ── Enums ─────────────────────────────────────────────────────────────────────

export type DestinoOperativo = 'PRODUCCION' | 'DESPACHO_DIRECTO' | 'MIXTO';

export type EstadoValidacion = 'APROBADA' | 'RECHAZADA' | 'REQUIERE_AJUSTE';

// ── Referencias embebidas ─────────────────────────────────────────────────────

export interface ClienteResumen {
  id: string;
  razonSocial: string;
  identificacion: string;
}

export interface UsuarioResumen {
  id: string;
  nombre: string;
}

export interface SedeResumen {
  id: string;
  nombre: string;
  codigo: string;
}

export interface ItemResumen {
  id: string;
  nombre: string;
  codigo: string;
  unidadMedida: string;
}

export interface EstadoResumen {
  id: string;
  codigo: string;
  nombre: string;
  color: string | null;
}

// ── Ítem de pedido ────────────────────────────────────────────────────────────

export interface ItemPedido {
  id: string;
  item: ItemResumen | null;
  descripcionOperativa: string;
  cantidadTotal: number;
  cantidadParaProduccion: number;
  cantidadParaDespachoEntero: number;
  destinoOperativo: DestinoOperativo;
  esMaterialCliente: boolean;
  observaciones: string | null;
  ordenLinea: number;
}

// ── Pedido ────────────────────────────────────────────────────────────────────

export interface Pedido {
  id: string;
  consecutivo: string;
  cliente: ClienteResumen;
  vendedor: UsuarioResumen | null;
  estado: EstadoResumen;
  sedeVenta: SedeResumen | null;
  sedeResponsable: SedeResumen | null;
  sedeDespacho: SedeResumen | null;
  fechaEntregaPrometida: string | null;
  observaciones: string | null;
  items: ItemPedido[];
  creadoEn: string;
  actualizadoEn: string;
}

// ── Historial de estado ───────────────────────────────────────────────────────

export interface HistorialEstadoPedido {
  id: string;
  estadoAnterior: EstadoResumen | null;
  estadoNuevo: EstadoResumen;
  usuario: UsuarioResumen | null;
  observaciones: string | null;
  creadoEn: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CrearItemPedidoPayload {
  itemId?: string;
  descripcionOperativa: string;
  cantidadTotal: number;
  cantidadParaProduccion: number;
  cantidadParaDespachoEntero: number;
  destinoOperativo: DestinoOperativo;
  esMaterialCliente?: boolean;
  observaciones?: string;
}

export interface CrearPedidoPayload {
  clienteId: string;
  sedeVentaId?: string;
  sedeResponsableId?: string;
  sedeDespachoId?: string;
  fechaEntregaPrometida?: string;
  observaciones?: string;
  items: CrearItemPedidoPayload[];
}

export interface CambiarEstadoPedidoPayload {
  estadoNuevoCodigo: string;
  observaciones?: string;
  forzar?: boolean;
}

export interface DetalleValidacion {
  concepto: string;
  estadoDetalle: string;
  observaciones?: string;
}

export interface ValidarPedidoPayload {
  estadoValidacion: EstadoValidacion;
  observaciones?: string;
  detalles?: DetalleValidacion[];
}

// ── Filtros listado ───────────────────────────────────────────────────────────

export interface FiltrosPedidos {
  clienteId?: string;
  estadoPedidoId?: string;
  pagina?: number;
  limite?: number;
}
