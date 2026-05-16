import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoServicio } from '../services/catalogo.servicio';
import type { FiltrosPaginados, CrearItemPayload, ActualizarItemPayload } from '../types/catalogo.types';

export function useItems(filtros: FiltrosPaginados = {}) {
  return useQuery({
    queryKey: ['items', filtros],
    queryFn: () => catalogoServicio.listarItems(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCrearItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearItemPayload) => catalogoServicio.crearItem(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}

export function useActualizarItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarItemPayload }) =>
      catalogoServicio.actualizarItem(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['items'] }),
  });
}
