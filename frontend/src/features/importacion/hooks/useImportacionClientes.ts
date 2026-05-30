import { useMutation } from '@tanstack/react-query';
import { importacionServicio } from '../services/importacion.servicio';
import type { FilaClienteEntrada } from '../types/importacion.types';

export function usePrevisualizarClientes() {
  return useMutation({
    mutationFn: (filas: FilaClienteEntrada[]) =>
      importacionServicio.previsualizarClientes(filas),
  });
}

export function useConfirmarImportacionClientes() {
  return useMutation({
    mutationFn: (filas: FilaClienteEntrada[]) =>
      importacionServicio.confirmarImportacionClientes(filas),
  });
}
