import { useQuery } from '@tanstack/react-query';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi, ResumenGeneralDashboard } from '@/shared/types';

async function obtenerResumen(): Promise<ResumenGeneralDashboard> {
  const { data } = await clienteApi.get<RespuestaApi<ResumenGeneralDashboard>>(
    '/reportes/dashboard/resumen-general',
  );
  if (!data.exito || !data.datos) throw new Error(data.mensaje ?? 'Error al obtener resumen');
  return data.datos;
}

export function useResumenGeneral() {
  return useQuery({
    queryKey: ['dashboard', 'resumen-general'],
    queryFn: obtenerResumen,
    staleTime: 60_000,
    retry: 1,
  });
}
