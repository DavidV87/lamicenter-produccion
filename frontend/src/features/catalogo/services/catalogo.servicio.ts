import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  RespuestaPaginada,
  FiltrosPaginados,
  Cliente, CrearClientePayload, ActualizarClientePayload,
  Item, CrearItemPayload, ActualizarItemPayload,
  Proveedor, CrearProveedorPayload, ActualizarProveedorPayload,
  Maquina, CrearMaquinaPayload, ActualizarMaquinaPayload,
  Ubicacion, CrearUbicacionPayload, ActualizarUbicacionPayload,
} from '../types/catalogo.types';

function construirParams(filtros: FiltrosPaginados): string {
  const params = new URLSearchParams();
  if (filtros.busqueda)          params.set('busqueda', filtros.busqueda);
  if (filtros.activo !== undefined) params.set('activo', String(filtros.activo));
  if (filtros.pagina !== undefined) params.set('pagina',  String(filtros.pagina));
  if (filtros.limite !== undefined) params.set('limite',  String(filtros.limite));
  return params.toString();
}

// ── Clientes ──────────────────────────────────────────────────────────────────

export const catalogoServicio = {
  async listarClientes(filtros: FiltrosPaginados = {}): Promise<RespuestaPaginada<Cliente>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Cliente>>>(
      `/catalogo/clientes?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearCliente(payload: CrearClientePayload): Promise<Cliente> {
    const { data } = await clienteApi.post<RespuestaApi<Cliente>>('/catalogo/clientes', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async actualizarCliente(id: string, payload: ActualizarClientePayload): Promise<Cliente> {
    const { data } = await clienteApi.patch<RespuestaApi<Cliente>>(
      `/catalogo/clientes/${id}`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Items ───────────────────────────────────────────────────────────────────

  async listarItems(filtros: FiltrosPaginados = {}): Promise<RespuestaPaginada<Item>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Item>>>(
      `/catalogo/items?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearItem(payload: CrearItemPayload): Promise<Item> {
    const { data } = await clienteApi.post<RespuestaApi<Item>>('/catalogo/items', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async actualizarItem(id: string, payload: ActualizarItemPayload): Promise<Item> {
    const { data } = await clienteApi.patch<RespuestaApi<Item>>(
      `/catalogo/items/${id}`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Proveedores ─────────────────────────────────────────────────────────────

  async listarProveedores(filtros: FiltrosPaginados = {}): Promise<RespuestaPaginada<Proveedor>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Proveedor>>>(
      `/catalogo/proveedores?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearProveedor(payload: CrearProveedorPayload): Promise<Proveedor> {
    const { data } = await clienteApi.post<RespuestaApi<Proveedor>>(
      '/catalogo/proveedores',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async actualizarProveedor(id: string, payload: ActualizarProveedorPayload): Promise<Proveedor> {
    const { data } = await clienteApi.patch<RespuestaApi<Proveedor>>(
      `/catalogo/proveedores/${id}`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Máquinas ────────────────────────────────────────────────────────────────

  async listarMaquinas(filtros: FiltrosPaginados = {}): Promise<RespuestaPaginada<Maquina>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Maquina>>>(
      `/catalogo/maquinas?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearMaquina(payload: CrearMaquinaPayload): Promise<Maquina> {
    const { data } = await clienteApi.post<RespuestaApi<Maquina>>('/catalogo/maquinas', payload);
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async actualizarMaquina(id: string, payload: ActualizarMaquinaPayload): Promise<Maquina> {
    const { data } = await clienteApi.patch<RespuestaApi<Maquina>>(
      `/catalogo/maquinas/${id}`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  // ── Ubicaciones ─────────────────────────────────────────────────────────────

  async listarUbicaciones(filtros: FiltrosPaginados = {}): Promise<RespuestaPaginada<Ubicacion>> {
    const { data } = await clienteApi.get<RespuestaApi<RespuestaPaginada<Ubicacion>>>(
      `/catalogo/ubicaciones?${construirParams(filtros)}`,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async crearUbicacion(payload: CrearUbicacionPayload): Promise<Ubicacion> {
    const { data } = await clienteApi.post<RespuestaApi<Ubicacion>>(
      '/catalogo/ubicaciones',
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async actualizarUbicacion(id: string, payload: ActualizarUbicacionPayload): Promise<Ubicacion> {
    const { data } = await clienteApi.patch<RespuestaApi<Ubicacion>>(
      `/catalogo/ubicaciones/${id}`,
      payload,
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
