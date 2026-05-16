import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogoServicio } from '../services/catalogo.servicio';
import type { FiltrosPaginados, CrearProveedorPayload, ActualizarProveedorPayload } from '../types/catalogo.types';

export function useProveedores(filtros: FiltrosPaginados = {}) {
  return useQuery({
    queryKey: ['proveedores', filtros],
    queryFn: () => catalogoServicio.listarProveedores(filtros),
    staleTime: 30_000,
    retry: 1,
  });
}

export function useCrearProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CrearProveedorPayload) => catalogoServicio.crearProveedor(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}

export function useActualizarProveedor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ActualizarProveedorPayload }) =>
      catalogoServicio.actualizarProveedor(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['proveedores'] }),
  });
}
