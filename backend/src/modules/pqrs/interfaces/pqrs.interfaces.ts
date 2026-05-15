import { RolResponsablePqrs, TipoEvidenciaPqrs, TipoSeguimientoPqrs } from '@prisma/client';

export interface UsuarioResumen {
  id: string;
  nombre: string;
}

export interface EstadoResumen {
  id: string;
  nombre: string;
  codigo: string;
}

export interface TipoNovedadResumen {
  id: string;
  nombre: string;
}

export interface SeguimientoPqrsResumen {
  id: string;
  tipoSeguimiento: TipoSeguimientoPqrs;
  descripcion: string;
  observaciones: string | null;
  creadoPor: UsuarioResumen;
  creadoEn: Date;
}

export interface EvidenciaPqrsResumen {
  id: string;
  tipoEvidencia: TipoEvidenciaPqrs;
  rutaArchivo: string | null;
  nombreOriginal: string | null;
  descripcion: string | null;
  creadoPor: UsuarioResumen;
  creadoEn: Date;
}

export interface ResponsablePqrsResumen {
  id: string;
  usuario: UsuarioResumen;
  rolResponsable: RolResponsablePqrs;
  activo: boolean;
  fechaAsignacion: Date;
  fechaFinAsignacion: Date | null;
  asignadoPor: UsuarioResumen | null;
  observaciones: string | null;
}

export interface PqrsResumen {
  id: string;
  consecutivo: string;
  cliente: { id: string; razonSocial: string };
  tipoNovedad: TipoNovedadResumen;
  estadoPqrs: EstadoResumen;
  descripcion: string;
  generaReproceso: boolean;
  costoEstimado: number | null;
  creadoPor: UsuarioResumen;
  creadoEn: Date;
}

export interface PqrsDetalle extends PqrsResumen {
  pedidoId: string | null;
  facturaId: string | null;
  ordenProduccionId: string | null;
  subordenId: string | null;
  pedidoItemId: string | null;
  novedadOperativaId: string | null;
  reprocesoId: string | null;
  solucionAplicada: string | null;
  responsableSolucion: UsuarioResumen | null;
  cerradoPor: UsuarioResumen | null;
  fechaCierre: Date | null;
  metadata: Record<string, unknown> | null;
  seguimientos: SeguimientoPqrsResumen[];
  evidencias: EvidenciaPqrsResumen[];
  responsables: ResponsablePqrsResumen[];
  actualizadoEn: Date;
}

export interface ListaPaginadaPqrs {
  datos: PqrsResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface CrearPqrsRespuesta {
  pqrs: PqrsDetalle;
  advertencias: string[];
}
