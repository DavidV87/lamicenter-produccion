/** Resumen de una orden de producción para listados paginados. */
export interface OrdenProduccionResumen {
  id: string;
  pedidoId: string;
  sedeProduccion: { id: string; nombre: string };
  sedeActual: { id: string; nombre: string };
  sedeDespacho: { id: string; nombre: string } | null;
  maquinaPrincipal: { id: string; nombre: string; codigo: string } | null;
  estado: { id: string; codigo: string; nombre: string };
  creadoPor: { id: string; nombre: string };
  ordenPrioridad: number;
  fechaInicioPlaneada: Date | null;
  fechaFinPlaneada: Date | null;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Resultado paginado del listado de órdenes de producción. */
export interface ListaPaginadaOrdenes {
  datos: OrdenProduccionResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
