import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoServicio } from '../services/catalogo.servicio';
import type { FiltrosPaginados, CrearUbicacionPayload, ActualizarUbicacionPayload } from '../types/catalogo.types';

export function useUbicaciones(filtros: FiltrosPaginados = {}) {
  return useQuery({
    queryKey: ['ubicaciones', filtros],
    queryFn: () => catalogoServicio.listarUbicaciones(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCrearUbicacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearUbicacionPayload) => catalogoServicio.crearUbicacion(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ubicaciones'] }),
  });
}

export function useActualizarUbicacion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarUbicacionPayload }) =>
      catalogoServicio.actualizarUbicacion(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ubicaciones'] }),
  });
}
