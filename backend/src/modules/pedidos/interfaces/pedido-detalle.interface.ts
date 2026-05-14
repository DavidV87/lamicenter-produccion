export interface PedidoItemDetalle {
  id: string;
  descripcion: string;
  cantidad: number;
  cantidadTotal: number;
  cantidadParaProduccion: number;
  cantidadParaDespachoEntero: number;
  cantidadPendiente: number;
  precioUnitario: number | null;
  destinoOperativo: string;
  esMaterialCliente: boolean;
  observaciones: string | null;
  item: { id: string; nombre: string; codigo: string } | null;
  creadoEn: Date;
}

export interface ValidacionResumen {
  id: string;
  estadoValidacion: string;
  validadoPor: { id: string; nombre: string } | null;
  observaciones: string | null;
  detalles: {
    id: string;
    tipoVerificacion: string;
    aprobado: boolean;
    observaciones: string | null;
  }[];
  creadoEn: Date;
}

export interface HistorialEstadoResumen {
  id: string;
  estadoAnterior: { id: string; codigo: string; nombre: string } | null;
  estadoNuevo: { id: string; codigo: string; nombre: string };
  creadoPor: { id: string; nombre: string } | null;
  observaciones: string | null;
  creadoEn: Date;
}

export interface PedidoDetalle {
  id: string;
  cliente: { id: string; razonSocial: string };
  sedeVenta: { id: string; nombre: string };
  sedeResponsable: { id: string; nombre: string };
  sedeDespacho: { id: string; nombre: string } | null;
  vendedor: { id: string; nombre: string } | null;
  creadoPor: { id: string; nombre: string };
  estado: { id: string; codigo: string; nombre: string };
  items: PedidoItemDetalle[];
  validaciones: ValidacionResumen[];
  observaciones: string | null;
  fechaEntregaPrometida: Date | null;
  fechaListoDespacho: Date | null;
  fechaDespachoCompleto: Date | null;
  metadata: Record<string, unknown> | null;
  creadoEn: Date;
  actualizadoEn: Date;
}
