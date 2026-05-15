/** Línea de ítem dentro de una solicitud de compra. */
export interface SolicitudCompraItemResumen {
  id: string;
  item: { id: string; nombre: string; codigo: string };
  requerimientoMaterialId: string | null;
  cantidadSolicitada: number;
  observaciones: string | null;
  creadoEn: Date;
}

/** Resumen de una solicitud de compra para listados paginados. */
export interface SolicitudCompraResumen {
  id: string;
  codigo: string;
  sede: { id: string; nombre: string };
  proveedor: { id: string; nombre: string } | null;
  estado: { id: string; codigo: string; nombre: string };
  creadoPor: { id: string; nombre: string };
  fechaSolicitud: Date;
  observaciones: string | null;
  totalItems: number;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Resultado paginado del listado de solicitudes de compra. */
export interface ListaPaginadaSolicitudesCompra {
  datos: SolicitudCompraResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/** Detalle completo de una solicitud de compra con sus líneas. */
export interface SolicitudCompraDetalle {
  id: string;
  codigo: string;
  sede: { id: string; nombre: string };
  proveedor: { id: string; nombre: string } | null;
  estado: { id: string; codigo: string; nombre: string };
  creadoPor: { id: string; nombre: string };
  autorizadoPor: { id: string; nombre: string } | null;
  fechaSolicitud: Date;
  fechaRequerida: Date | null;
  observaciones: string | null;
  metadata: Record<string, unknown> | null;
  items: SolicitudCompraItemResumen[];
  creadoEn: Date;
  actualizadoEn: Date;
}
