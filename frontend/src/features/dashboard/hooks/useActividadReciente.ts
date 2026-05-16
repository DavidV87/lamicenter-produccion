import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi, ActividadReciente } from '@/shared/types';

async function obtenerActividad(): Promise<ActividadReciente[]> {
  const { data } = await clienteApi.get<RespuestaApi<ActividadReciente[]>>(
    '/reportes/dashboard/actividad-reciente',
  );
  if (!data.exito || !data.datos) throw new Error(data.mensaje ?? 'Error al obtener actividad');
  return data.datos;
}

export function useActividadReciente() {
  return useQuery({
    queryKey: ['dashboard', 'actividad-reciente'],
    queryFn: obtenerActividad,
    staleTime: 30_000,
    retry: 1,
  });
}
