import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { despachoServicio } from '../services/despacho.servicio';
import type {
  FiltrosDespachos,
  CrearDespachoPayload,
  CambiarEstadoDespachoPayload,
  CrearChecklistPayload,
  CrearEvidenciaPayload,
  ActualizarUbicacionPayload,
} from '../types/despacho.types';

// ── Despachos ─────────────────────────────────────────────────────────────────

export function useDespachos(filtros: FiltrosDespachos = {}) {
  return useQuery({
    queryKey: ['despachos', filtros],
    queryFn: () => despachoServicio.listar(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useDespachoDetalle(id: string) {
  return useQuery({
    queryKey: ['despacho', id],
    queryFn: () => despachoServicio.obtener(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useCrearDespacho() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearDespachoPayload) => despachoServicio.crear(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['despachos'] }),
  });
}

export function useCambiarEstadoDespacho(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoDespachoPayload) =>
      despachoServicio.cambiarEstado(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['despacho', id] });
      qc.invalidateQueries({ queryKey: ['despachos'] });
    },
  });
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export function useChecklistDespacho(despachoId: string) {
  return useQuery({
    queryKey: ['despacho-checklist', despachoId],
    queryFn: () => despachoServicio.obtenerChecklist(despachoId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!despachoId,
  });
}

export function useCrearChecklistDespacho(despachoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearChecklistPayload) =>
      despachoServicio.crearChecklist(despachoId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['despacho-checklist', despachoId] });
      qc.invalidateQueries({ queryKey: ['despacho', despachoId] });
    },
  });
}

// ── Evidencias ────────────────────────────────────────────────────────────────

export function useEvidenciasDespacho(despachoId: string) {
  return useQuery({
    queryKey: ['despacho-evidencias', despachoId],
    queryFn: () => despachoServicio.listarEvidencias(despachoId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!despachoId,
  });
}

export function useCrearEvidenciaDespacho(despachoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEvidenciaPayload) =>
      despachoServicio.crearEvidencia(despachoId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['despacho-evidencias', despachoId] }),
  });
}

// ── Ubicación pedido ──────────────────────────────────────────────────────────

export function useUbicacionPedido(pedidoId: string) {
  return useQuery({
    queryKey: ['ubicacion-pedido', pedidoId],
    queryFn: () => despachoServicio.obtenerUbicacionPedido(pedidoId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!pedidoId,
  });
}

export function useActualizarUbicacionPedido(pedidoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActualizarUbicacionPayload) =>
      despachoServicio.actualizarUbicacionPedido(pedidoId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ubicacion-pedido', pedidoId] }),
  });
}

// ── Referencia ────────────────────────────────────────────────────────────────

export function useTiposValidacionDespacho() {
  return useQuery({
    queryKey: ['tipos-validacion-despacho'],
    queryFn: () => despachoServicio.listarTiposValidacion(),
    staleTime: 5 * 60_000,
    retry: 1,
  });
}
