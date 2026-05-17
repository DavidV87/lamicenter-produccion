import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  PqrsResumen,
  PqrsDetalle,
  SeguimientoPqrs,
  EvidenciaPqrs,
  ResponsablePqrs,
  CrearPqrsRespuesta,
  RespuestaPaginada,
  FiltrosPqrs,
  CrearPqrsPayload,
  CambiarEstadoPqrsPayload,
  CrearSeguimientoPayload,
  CrearEvidenciaPqrsPayload,
  AsignarResponsablePayload,
} from '../types/pqrs.types';

function construirParams(filtros: FiltrosPqrs): string {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  return p.toString();
}

export const pqrsServicio = {
  // ── PQRS ──────────────────────────────────────────────────────────────────────

  async listar(filtros: FiltrosPqrs = {}): Promise<RespuestaPaginada<PqrsResumen>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<PqrsResumen>>>(
      `/pqrs?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtener(id: string): Promise<PqrsDetalle> {
    const { data } = await clienteApi.get<RespuestaApi<PqrsDetalle>>(`/pqrs/${id}`);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crear(payload: CrearPqrsPayload): Promise<CrearPqrsRespuesta> {
    const { data } = await clienteApi.post<RespuestaApi<CrearPqrsRespuesta>>('/pqrs', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstado(id: string, payload: CambiarEstadoPqrsPayload): Promise<PqrsDetalle> {
    const { data } = await clienteApi.patch<RespuestaApi<PqrsDetalle>>(
      `/pqrs/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Seguimientos ──────────────────────────────────────────────────────────────

  async listarSeguimientos(pqrsId: string): Promise<SeguimientoPqrs[]> {
    const { data } = await clienteApi.get<RespuestaApi<SeguimientoPqrs[]>>(
      `/pqrs/${pqrsId}/seguimientos`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearSeguimiento(pqrsId: string, payload: CrearSeguimientoPayload): Promise<SeguimientoPqrs> {
    const { data } = await clienteApi.post<RespuestaApi<SeguimientoPqrs>>(
      `/pqrs/${pqrsId}/seguimientos`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Evidencias ────────────────────────────────────────────────────────────────

  async listarEvidencias(pqrsId: string): Promise<EvidenciaPqrs[]> {
    const { data } = await clienteApi.get<RespuestaApi<EvidenciaPqrs[]>>(
      `/pqrs/${pqrsId}/evidencias`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearEvidencia(pqrsId: string, payload: CrearEvidenciaPqrsPayload): Promise<EvidenciaPqrs> {
    const { data } = await clienteApi.post<RespuestaApi<EvidenciaPqrs>>(
      `/pqrs/${pqrsId}/evidencias`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Responsables ──────────────────────────────────────────────────────────────

  async listarResponsables(pqrsId: string): Promise<ResponsablePqrs[]> {
    const { data } = await clienteApi.get<RespuestaApi<ResponsablePqrs[]>>(
      `/pqrs/${pqrsId}/responsables`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async asignarResponsable(
    pqrsId: string,
    payload: AsignarResponsablePayload,
  ): Promise<ResponsablePqrs> {
    const { data } = await clienteApi.post<RespuestaApi<ResponsablePqrs>>(
      `/pqrs/${pqrsId}/responsables`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
