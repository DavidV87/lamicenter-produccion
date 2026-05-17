import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  RequerimientoMaterial,
  SolicitudCompra,
  RespuestaPaginada,
  FiltrosRequerimientos,
  FiltrosSolicitudes,
  CrearRequerimientoPayload,
  CambiarEstadoAbastecimientoPayload,
  CrearSolicitudCompraPayload,
} from '../types/abastecimiento.types';

function construirParams(filtros: FiltrosRequerimientos | FiltrosSolicitudes): string {
  const p = new URLSearchParams();
  if (filtros.pagina !== undefined) p.set('pagina', String(filtros.pagina));
  if (filtros.limite !== undefined) p.set('limite', String(filtros.limite));
  if ('busqueda' in filtros && filtros.busqueda) p.set('busqueda', filtros.busqueda);
  return p.toString();
}

export const abastecimientoServicio = {
  // ── Requerimientos de material ──────────────────────────────────────────────

  async listarRequerimientos(
    filtros: FiltrosRequerimientos = {},
  ): Promise<RespuestaPaginada<RequerimientoMaterial>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<RequerimientoMaterial>>>(
      `/abastecimiento/requerimientos?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtenerRequerimiento(id: string): Promise<RequerimientoMaterial> {
    const { data } = await clienteApi.get<RespuestaApi<RequerimientoMaterial>>(
      `/abastecimiento/requerimientos/${id}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearRequerimiento(payload: CrearRequerimientoPayload): Promise<RequerimientoMaterial> {
    const { data } = await clienteApi.post<RespuestaApi<RequerimientoMaterial>>(
      '/abastecimiento/requerimientos',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstadoRequerimiento(
    id: string,
    payload: CambiarEstadoAbastecimientoPayload,
  ): Promise<RequerimientoMaterial> {
    const { data } = await clienteApi.patch<RespuestaApi<RequerimientoMaterial>>(
      `/abastecimiento/requerimientos/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Solicitudes de compra ───────────────────────────────────────────────────

  async listarSolicitudes(
    filtros: FiltrosSolicitudes = {},
  ): Promise<RespuestaPaginada<SolicitudCompra>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<SolicitudCompra>>>(
      `/abastecimiento/solicitudes-compra?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async obtenerSolicitud(id: string): Promise<SolicitudCompra> {
    const { data } = await clienteApi.get<RespuestaApi<SolicitudCompra>>(
      `/abastecimiento/solicitudes-compra/${id}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearSolicitud(payload: CrearSolicitudCompraPayload): Promise<SolicitudCompra> {
    const { data } = await clienteApi.post<RespuestaApi<SolicitudCompra>>(
      '/abastecimiento/solicitudes-compra',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async cambiarEstadoSolicitud(
    id: string,
    payload: CambiarEstadoAbastecimientoPayload,
  ): Promise<SolicitudCompra> {
    const { data } = await clienteApi.patch<RespuestaApi<SolicitudCompra>>(
      `/abastecimiento/solicitudes-compra/${id}/estado`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
