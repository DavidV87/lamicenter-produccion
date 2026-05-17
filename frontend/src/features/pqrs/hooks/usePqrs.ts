import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pqrsServicio } from '../services/pqrs.servicio';
import type {
  FiltrosPqrs,
  CrearPqrsPayload,
  CambiarEstadoPqrsPayload,
  CrearSeguimientoPayload,
  CrearEvidenciaPqrsPayload,
  AsignarResponsablePayload,
} from '../types/pqrs.types';

// ── PQRS ──────────────────────────────────────────────────────────────────────

export function usePqrs(filtros: FiltrosPqrs = {}) {
  return useQuery({
    queryKey: ['pqrs-lista', filtros],
    queryFn: () => pqrsServicio.listar(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function usePqrsDetalle(id: string) {
  return useQuery({
    queryKey: ['pqrs', id],
    queryFn: () => pqrsServicio.obtener(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useCrearPqrs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearPqrsPayload) => pqrsServicio.crear(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pqrs-lista'] }),
  });
}

export function useCambiarEstadoPqrs(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoPqrsPayload) => pqrsServicio.cambiarEstado(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs', id] });
      qc.invalidateQueries({ queryKey: ['pqrs-lista'] });
    },
  });
}

// ── Seguimientos ──────────────────────────────────────────────────────────────

export function useSeguimientosPqrs(pqrsId: string) {
  return useQuery({
    queryKey: ['pqrs-seguimientos', pqrsId],
    queryFn: () => pqrsServicio.listarSeguimientos(pqrsId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!pqrsId,
  });
}

export function useCrearSeguimiento(pqrsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearSeguimientoPayload) =>
      pqrsServicio.crearSeguimiento(pqrsId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs-seguimientos', pqrsId] });
      qc.invalidateQueries({ queryKey: ['pqrs', pqrsId] });
    },
  });
}

// ── Evidencias ────────────────────────────────────────────────────────────────

export function useEvidenciasPqrs(pqrsId: string) {
  return useQuery({
    queryKey: ['pqrs-evidencias', pqrsId],
    queryFn: () => pqrsServicio.listarEvidencias(pqrsId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!pqrsId,
  });
}

export function useCrearEvidenciaPqrs(pqrsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearEvidenciaPqrsPayload) =>
      pqrsServicio.crearEvidencia(pqrsId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pqrs-evidencias', pqrsId] }),
  });
}

// ── Responsables ──────────────────────────────────────────────────────────────

export function useResponsablesPqrs(pqrsId: string) {
  return useQuery({
    queryKey: ['pqrs-responsables', pqrsId],
    queryFn: () => pqrsServicio.listarResponsables(pqrsId),
    staleTime: 15_000,
    retry: 1,
    enabled: !!pqrsId,
  });
}

export function useAsignarResponsable(pqrsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AsignarResponsablePayload) =>
      pqrsServicio.asignarResponsable(pqrsId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pqrs-responsables', pqrsId] });
      qc.invalidateQueries({ queryKey: ['pqrs', pqrsId] });
    },
  });
}
