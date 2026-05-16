// ── Paginación ────────────────────────────────────────────────────────────────

export interface RespuestaPaginada<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ── Enums (espejo de Prisma) ──────────────────────────────────────────────────

export type TipoIdentificacion = 'NIT' | 'CC' | 'CE' | 'PAS' | 'OTRO';
export type UnidadMedida =
  | 'METRO_CUADRADO'
  | 'METRO_LINEAL'
  | 'UNIDAD'
  | 'HOJA'
  | 'KILOGRAMO'
  | 'LITRO'
  | 'METRO_CUBICO';
export type TipoProveedor = 'MATERIAL' | 'SERVICIO' | 'TRANSPORTE' | 'MIXTO';

// ── Clientes ──────────────────────────────────────────────────────────────────

export interface Cliente {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  sedePrincipal: string | null;
  telefono: string | null;
  correo: string | null;
  ciudad: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface CrearClientePayload {
  razonSocial: string;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  nombreComercial?: string;
  sedePrincipalId?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
}

export interface ActualizarClientePayload extends Partial<CrearClientePayload> {
  activo?: boolean;
}

// ── Items ─────────────────────────────────────────────────────────────────────

export interface TipoItemResumen {
  id: string;
  nombre: string;
  comportamiento: string;
}

export interface Item {
  id: string;
  tipoItem: TipoItemResumen;
  codigo: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  precioVentaReferencia: number | null;
  costoReferencia: number | null;
  controlaInventario: boolean;
  requiereCorte: boolean;
  permiteFraccion: boolean;
  activo: boolean;
  creadoEn: string;
}

export interface CrearItemPayload {
  tipoItemId: string;
  codigo: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  descripcion?: string;
  precioVentaReferencia?: number;
  costoReferencia?: number;
  controlaInventario?: boolean;
  requiereCorte?: boolean;
  permiteFraccion?: boolean;
}

export interface ActualizarItemPayload extends Partial<CrearItemPayload> {
  activo?: boolean;
}

// ── Proveedores ───────────────────────────────────────────────────────────────

export interface Proveedor {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  tipoProveedor: TipoProveedor;
  telefono: string | null;
  correo: string | null;
  ciudad: string | null;
  activo: boolean;
  creadoEn: string;
}

export interface CrearProveedorPayload {
  razonSocial: string;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  tipoProveedor: TipoProveedor;
  nombreComercial?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
}

export interface ActualizarProveedorPayload extends Partial<CrearProveedorPayload> {
  activo?: boolean;
}

// ── Máquinas ──────────────────────────────────────────────────────────────────

export interface SedeResumen {
  id: string;
  nombre: string;
}

export interface Maquina {
  id: string;
  sede: SedeResumen;
  nombre: string;
  codigo: string;
  activo: boolean;
  creadoEn: string;
}

export interface CrearMaquinaPayload {
  sedeId: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
}

export interface ActualizarMaquinaPayload extends Partial<CrearMaquinaPayload> {
  activo?: boolean;
}

// ── Ubicaciones ───────────────────────────────────────────────────────────────

export interface Ubicacion {
  id: string;
  sede: SedeResumen;
  nombre: string;
  codigo: string;
  activo: boolean;
  creadoEn: string;
}

export interface CrearUbicacionPayload {
  sedeId: string;
  nombre: string;
  codigo: string;
  descripcion?: string;
}

export interface ActualizarUbicacionPayload extends Partial<CrearUbicacionPayload> {
  activo?: boolean;
}

// ── Query params comunes ──────────────────────────────────────────────────────

export interface FiltrosPaginados {
  busqueda?: string;
  activo?: boolean;
  pagina?: number;
  limite?: number;
}
