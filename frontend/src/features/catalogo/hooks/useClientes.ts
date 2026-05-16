import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoServicio } from '../services/catalogo.servicio';
import type { FiltrosPaginados, CrearClientePayload, ActualizarClientePayload } from '../types/catalogo.types';

export function useClientes(filtros: FiltrosPaginados = {}) {
  return useQuery({
    queryKey: ['clientes', filtros],
    queryFn: () => catalogoServicio.listarClientes(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCrearCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearClientePayload) => catalogoServicio.crearCliente(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}

export function useActualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarClientePayload }) =>
      catalogoServicio.actualizarCliente(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clientes'] }),
  });
}
