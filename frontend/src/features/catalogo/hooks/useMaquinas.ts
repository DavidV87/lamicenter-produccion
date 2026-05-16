import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoServicio } from '../services/catalogo.servicio';
import type { FiltrosPaginados, CrearMaquinaPayload, ActualizarMaquinaPayload } from '../types/catalogo.types';

export function useMaquinas(filtros: FiltrosPaginados = {}) {
  return useQuery({
    queryKey: ['maquinas', filtros],
    queryFn: () => catalogoServicio.listarMaquinas(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCrearMaquina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearMaquinaPayload) => catalogoServicio.crearMaquina(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maquinas'] }),
  });
}

export function useActualizarMaquina() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarMaquinaPayload }) =>
      catalogoServicio.actualizarMaquina(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maquinas'] }),
  });
}
