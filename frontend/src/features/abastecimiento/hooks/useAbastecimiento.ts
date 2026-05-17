import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { abastecimientoServicio } from '../services/abastecimiento.servicio';
import type {
  FiltrosRequerimientos,
  FiltrosSolicitudes,
  CrearRequerimientoPayload,
  CambiarEstadoAbastecimientoPayload,
  CrearSolicitudCompraPayload,
} from '../types/abastecimiento.types';

// ── Requerimientos ────────────────────────────────────────────────────────────

export function useRequerimientos(filtros: FiltrosRequerimientos = {}) {
  return useQuery({
    queryKey: ['requerimientos', filtros],
    queryFn: () => abastecimientoServicio.listarRequerimientos(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useRequerimientoDetalle(id: string) {
  return useQuery({
    queryKey: ['requerimiento', id],
    queryFn: () => abastecimientoServicio.obtenerRequerimiento(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useCrearRequerimiento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearRequerimientoPayload) =>
      abastecimientoServicio.crearRequerimiento(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['requerimientos'] }),
  });
}

export function useCambiarEstadoRequerimiento(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoAbastecimientoPayload) =>
      abastecimientoServicio.cambiarEstadoRequerimiento(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['requerimiento', id] });
      qc.invalidateQueries({ queryKey: ['requerimientos'] });
    },
  });
}

// ── Solicitudes de compra ─────────────────────────────────────────────────────

export function useSolicitudesCompra(filtros: FiltrosSolicitudes = {}) {
  return useQuery({
    queryKey: ['solicitudes-compra', filtros],
    queryFn: () => abastecimientoServicio.listarSolicitudes(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useSolicitudCompraDetalle(id: string) {
  return useQuery({
    queryKey: ['solicitud-compra', id],
    queryFn: () => abastecimientoServicio.obtenerSolicitud(id),
    staleTime: 15_000,
    retry: 1,
    enabled: !!id,
  });
}

export function useCrearSolicitudCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearSolicitudCompraPayload) =>
      abastecimientoServicio.crearSolicitud(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['solicitudes-compra'] }),
  });
}

export function useCambiarEstadoSolicitud(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CambiarEstadoAbastecimientoPayload) =>
      abastecimientoServicio.cambiarEstadoSolicitud(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['solicitud-compra', id] });
      qc.invalidateQueries({ queryKey: ['solicitudes-compra'] });
    },
  });
}
