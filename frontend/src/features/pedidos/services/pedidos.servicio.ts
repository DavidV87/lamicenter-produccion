import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  Pedido,
  RespuestaPaginada,
  FiltrosPedidos,
  CrearPedidoPayload,
  CambiarEstadoPedidoPayload,
  ValidarPedidoPayload,
  HistorialEstadoPedido,
} from '../types/pedidos.types';

function construirParams(filtros: FiltrosPedidos): string {
  const params = new URLSearchParams();
  if (filtros.clienteId)     params.set('clienteId',     filtros.clienteId);
  if (filtros.estadoPedidoId) params.set('estadoPedidoId', filtros.estadoPedidoId);
  if (filtros.busqueda)      params.set('busqueda',      filtros.busqueda);
  if (filtros.pagina !== undefined) params.set('pagina', String(filtros.pagina));
  if (filtros.limite !== undefined) params.set('limite', String(filtros.limite));
  return params.toString();
}

export const pedidosServicio = {
  async listar(filtros: FiltrosPedidos = {}): Promise<RespuestaPaginada<Pedido>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Pedido>>>(
      `/pedidos?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtener(id: string): Promise<Pedido> {
    const { data } = await clienteApi.get<RespuestaApi<Pedido>>(`/pedidos/${id}`);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crear(payload: CrearPedidoPayload): Promise<Pedido> {
    const { data } = await clienteApi.post<RespuestaApi<Pedido>>('/pedidos', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstado(id: string, payload: CambiarEstadoPedidoPayload): Promise<Pedido> {
    const { data } = await clienteApi.patch<RespuestaApi<Pedido>>(
      `/pedidos/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async validar(id: string, payload: ValidarPedidoPayload): Promise<Pedido> {
    const { data } = await clienteApi.post<RespuestaApi<Pedido>>(
      `/pedidos/${id}/validar`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async historial(id: string): Promise<HistorialEstadoPedido[]> {
    const { data } = await clienteApi.get<RespuestaApi<HistorialEstadoPedido[]>>(
      `/pedidos/${id}/historial`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
