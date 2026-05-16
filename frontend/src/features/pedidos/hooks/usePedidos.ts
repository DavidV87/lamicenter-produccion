import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pedidosServicio } from '../services/pedidos.servicio';
import type {
  FiltrosPedidos,
  CrearPedidoPayload,
  CambiarEstadoPedidoPayload,
  ValidarPedidoPayload,
} from '../types/pedidos.types';

export function usePedidos(filtros: FiltrosPedidos = {}) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosServicio.listar(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePedidoDetalle(id: string) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => pedidosServicio.obtener(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useHistorialPedido(id: string) {
  return useQuery({
    queryKey: ['pedido-historial', id],
    queryFn: () => pedidosServicio.historial(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useCrearPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearPedidoPayload) => pedidosServicio.crear(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pedidos'] }),
  });
}

export function useCambiarEstadoPedido(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoPedidoPayload) =>
      pedidosServicio.cambiarEstado(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedido', id] });
      qc.invalidateQueries({ queryKey: ['pedido-historial', id] });
      qc.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}

export function useValidarPedido(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ValidarPedidoPayload) => pedidosServicio.validar(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pedido', id] });
      qc.invalidateQueries({ queryKey: ['pedido-historial', id] });
      qc.invalidateQueries({ queryKey: ['pedidos'] });
    },
  });
}
