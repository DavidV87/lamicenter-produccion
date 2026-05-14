export interface PedidoResumen {
  id: string;
  cliente: { id: string; razonSocial: string };
  sedeVenta: { id: string; nombre: string };
  sedeResponsable: { id: string; nombre: string };
  vendedor: { id: string; nombre: string } | null;
  estado: { id: string; codigo: string; nombre: string };
  totalItems: number;
  observaciones: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface ListaPaginadaPedidos {
  datos: PedidoResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
