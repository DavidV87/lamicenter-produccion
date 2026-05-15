import { ComportamientoTipoItem, TipoIdentificacion, TipoProveedor, UnidadMedida } from '@prisma/client';

// ===========================================================================
// CLIENTES
// ===========================================================================

export interface ContactoClienteResumen {
  id: string;
  nombre: string;
  cargo: string | null;
  telefono: string | null;
  correo: string | null;
  esPrincipal: boolean;
  activo: boolean;
}

export interface ClienteResumen {
  id: string;
  razonSocial: string;
  nombreComercial: string | null;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  sedePrincipal: { id: string; nombre: string } | null;
  telefono: string | null;
  correo: string | null;
  ciudad: string | null;
  activo: boolean;
  creadoEn: Date;
}

export interface ClienteDetalle extends ClienteResumen {
  direccion: string | null;
  actualizadoEn: Date;
  contactos: ContactoClienteResumen[];
}

export interface ListaPaginadaClientes {
  datos: ClienteResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ===========================================================================
// ITEMS
// ===========================================================================

export interface ItemResumen {
  id: string;
  tipoItem: { id: string; nombre: string; comportamiento: ComportamientoTipoItem };
  codigo: string;
  nombre: string;
  unidadMedida: UnidadMedida;
  precioVentaReferencia: number | null;
  costoReferencia: number | null;
  controlaInventario: boolean;
  requiereCorte: boolean;
  permiteFraccion: boolean;
  activo: boolean;
  creadoEn: Date;
}

export interface ItemDetalle extends ItemResumen {
  descripcion: string | null;
  metadata: unknown;
  actualizadoEn: Date;
}

export interface ListaPaginadaItems {
  datos: ItemResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ===========================================================================
// PROVEEDORES
// ===========================================================================

export interface ProveedorResumen {
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
  creadoEn: Date;
}

export interface ProveedorDetalle extends ProveedorResumen {
  direccion: string | null;
  actualizadoEn: Date;
}

export interface ListaPaginadaProveedores {
  datos: ProveedorResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ===========================================================================
// MAQUINAS
// ===========================================================================

export interface MaquinaResumen {
  id: string;
  sede: { id: string; nombre: string };
  nombre: string;
  codigo: string;
  activo: boolean;
  creadoEn: Date;
}

export interface MaquinaDetalle extends MaquinaResumen {
  descripcion: string | null;
  actualizadoEn: Date;
}

export interface ListaPaginadaMaquinas {
  datos: MaquinaResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

// ===========================================================================
// UBICACIONES
// ===========================================================================

export interface UbicacionResumen {
  id: string;
  sede: { id: string; nombre: string };
  nombre: string;
  codigo: string;
  activo: boolean;
  creadoEn: Date;
}

export interface UbicacionDetalle extends UbicacionResumen {
  descripcion: string | null;
  actualizadoEn: Date;
}

export interface ListaPaginadaUbicaciones {
  datos: UbicacionResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
