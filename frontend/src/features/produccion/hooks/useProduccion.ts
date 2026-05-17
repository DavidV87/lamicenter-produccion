import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { produccionServicio } from '../services/produccion.servicio';
import type {
  FiltrosOrdenesProduccion,
  CrearOrdenProduccionPayload,
  CambiarEstadoOrdenPayload,
  CrearEtapaPayload,
  AsignarEtapaPayload,
  CrearEventoOperativoPayload,
} from '../types/produccion.types';

export function useOrdenesProduccion(filtros: FiltrosOrdenesProduccion = {}) {
  return useQuery({
    queryKey: ['ordenes-produccion', filtros],
    queryFn: () => produccionServicio.listar(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useOrdenProduccionDetalle(id: string) {
  return useQuery({
    queryKey: ['orden-produccion', id],
    queryFn: () => produccionServicio.obtener(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useEventosOrden(ordenId: string) {
  return useQuery({
    queryKey: ['orden-produccion-eventos', ordenId],
    queryFn: () => produccionServicio.obtenerEventos(ordenId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!ordenId,
  });
}

export function useCrearOrdenProduccion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearOrdenProduccionPayload) => produccionServicio.crear(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ordenes-produccion'] }),
  });
}

export function useCambiarEstadoOrden(ordenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoOrdenPayload) =>
      produccionServicio.cambiarEstado(ordenId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orden-produccion', ordenId] });
      qc.invalidateQueries({ queryKey: ['ordenes-produccion'] });
    },
  });
}

export function useCrearOrdenEtapa(ordenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEtapaPayload) => produccionServicio.crearEtapa(ordenId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orden-produccion', ordenId] }),
  });
}

export function useAsignarOrdenEtapa(ordenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ etapaId, payload }: { etapaId: string; payload: AsignarEtapaPayload }) =>
      produccionServicio.asignarEtapa(etapaId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orden-produccion', ordenId] }),
  });
}

export function useCrearEventoOperativo(ordenId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEventoOperativoPayload) => produccionServicio.crearEvento(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orden-produccion', ordenId] });
      qc.invalidateQueries({ queryKey: ['orden-produccion-eventos', ordenId] });
    },
  });
}
