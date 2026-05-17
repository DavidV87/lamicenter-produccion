import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  OrdenProduccion,
  RespuestaPaginada,
  FiltrosOrdenesProduccion,
  CrearOrdenProduccionPayload,
  CambiarEstadoOrdenPayload,
  CrearEtapaPayload,
  AsignarEtapaPayload,
  CrearEventoOperativoPayload,
  EventoOperativo,
  EtapaOrden,
  AsignacionEtapa,
} from '../types/produccion.types';

function construirParams(filtros: FiltrosOrdenesProduccion): string {
  const params = new URLSearchParams();
  if (filtros.estadoOrdenId) params.set('estadoOrdenId', filtros.estadoOrdenId);
  if (filtros.pagina !== undefined) params.set('pagina', String(filtros.pagina));
  if (filtros.limite !== undefined) params.set('limite', String(filtros.limite));
  return params.toString();
}

export const produccionServicio = {
  async listar(filtros: FiltrosOrdenesProduccion = {}): Promise<RespuestaPaginada<OrdenProduccion>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<OrdenProduccion>>>(
      `/produccion/ordenes?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtener(id: string): Promise<OrdenProduccion> {
    const { data } = await clienteApi.get<RespuestaApi<OrdenProduccion>>(
      `/produccion/ordenes/${id}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crear(payload: CrearOrdenProduccionPayload): Promise<OrdenProduccion> {
    const { data } = await clienteApi.post<RespuestaApi<OrdenProduccion>>(
      '/produccion/ordenes',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstado(id: string, payload: CambiarEstadoOrdenPayload): Promise<OrdenProduccion> {
    const { data } = await clienteApi.patch<RespuestaApi<OrdenProduccion>>(
      `/produccion/ordenes/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearEtapa(ordenId: string, payload: CrearEtapaPayload): Promise<EtapaOrden> {
    const { data } = await clienteApi.post<RespuestaApi<EtapaOrden>>(
      `/produccion/ordenes/${ordenId}/etapas`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async asignarEtapa(etapaId: string, payload: AsignarEtapaPayload): Promise<AsignacionEtapa> {
    const { data } = await clienteApi.post<RespuestaApi<AsignacionEtapa>>(
      `/produccion/etapas/${etapaId}/asignaciones`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearEvento(payload: CrearEventoOperativoPayload): Promise<EventoOperativo> {
    const { data } = await clienteApi.post<RespuestaApi<EventoOperativo>>(
      '/produccion/eventos',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtenerEventos(ordenId: string): Promise<EventoOperativo[]> {
    const { data } = await clienteApi.get<RespuestaApi<EventoOperativo[]>>(
      `/produccion/ordenes/${ordenId}/eventos`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
