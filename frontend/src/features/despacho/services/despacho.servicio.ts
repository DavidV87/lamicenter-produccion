import axios from 'axios';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  Despacho,
  ChecklistDespacho,
  EvidenciaDespacho,
  UbicacionPedido,
  TipoValidacionDespacho,
  RespuestaPaginada,
  FiltrosDespachos,
  CrearDespachoPayload,
  CambiarEstadoDespachoPayload,
  CrearChecklistPayload,
  CrearEvidenciaPayload,
  ActualizarUbicacionPayload,
} from '../types/despacho.types';

function construirParams(filtros: FiltrosDespachos): string {
  const p = new URLSearchParams();
  Object.entries(filtros).forEach(([k, v]) => {
    if (v !== undefined && v !== '') p.set(k, String(v));
  });
  return p.toString();
}

export const despachoServicio = {
  // ── Despachos ─────────────────────────────────────────────────────────────────

  async listar(filtros: FiltrosDespachos = {}): Promise<RespuestaPaginada<Despacho>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Despacho>>>(
      `/despacho?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtener(id: string): Promise<Despacho> {
    const { data } = await clienteApi.get<RespuestaApi<Despacho>>(`/despacho/${id}`);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crear(payload: CrearDespachoPayload): Promise<Despacho> {
    const { data } = await clienteApi.post<RespuestaApi<Despacho>>('/despacho', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstado(id: string, payload: CambiarEstadoDespachoPayload): Promise<Despacho> {
    const { data } = await clienteApi.patch<RespuestaApi<Despacho>>(
      `/despacho/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Checklist ─────────────────────────────────────────────────────────────────

  async obtenerChecklist(despachoId: string): Promise<ChecklistDespacho | null> {
    try {
      const { data } = await clienteApi.get<RespuestaApi<ChecklistDespacho>>(
        `/despacho/${despachoId}/checklist`,
      );
      if (!data.exito || !data.datos) return null;
      return data.datos;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  async crearChecklist(despachoId: string, payload: CrearChecklistPayload): Promise<ChecklistDespacho> {
    const { data } = await clienteApi.post<RespuestaApi<ChecklistDespacho>>(
      `/despacho/${despachoId}/checklist`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Evidencias ────────────────────────────────────────────────────────────────

  async listarEvidencias(despachoId: string): Promise<EvidenciaDespacho[]> {
    const { data } = await clienteApi.get<RespuestaApi<EvidenciaDespacho[]>>(
      `/despacho/${despachoId}/evidencias`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearEvidencia(despachoId: string, payload: CrearEvidenciaPayload): Promise<EvidenciaDespacho> {
    const { data } = await clienteApi.post<RespuestaApi<EvidenciaDespacho>>(
      `/despacho/${despachoId}/evidencias`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Ubicación de pedido ───────────────────────────────────────────────────────

  async obtenerUbicacionPedido(pedidoId: string): Promise<UbicacionPedido | null> {
    try {
      const { data } = await clienteApi.get<RespuestaApi<UbicacionPedido>>(
        `/despacho/pedido/${pedidoId}/ubicacion`,
      );
      if (!data.exito || !data.datos) return null;
      return data.datos;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) return null;
      throw err;
    }
  },

  async actualizarUbicacionPedido(
    pedidoId: string,
    payload: ActualizarUbicacionPayload,
  ): Promise<UbicacionPedido> {
    const { data } = await clienteApi.patch<RespuestaApi<UbicacionPedido>>(
      `/despacho/pedido/${pedidoId}/ubicacion`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Referencia ────────────────────────────────────────────────────────────────

  async listarTiposValidacion(): Promise<TipoValidacionDespacho[]> {
    const { data } = await clienteApi.get<RespuestaApi<TipoValidacionDespacho[]>>(
      '/catalogo/tipos-validacion-despacho',
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
