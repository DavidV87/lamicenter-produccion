import { TipoEvidenciaDespacho } from '@prisma/client';

// ===========================================================================
// REFERENCIAS COMUNES
// ===========================================================================

interface UsuarioRef { id: string; nombre: string }
interface SedeRef    { id: string; nombre: string }
interface EstadoRef  { id: string; codigo: string; nombre: string }

// ===========================================================================
// CHECKLIST
// ===========================================================================

export interface ChecklistDespachoItemDetalle {
  id: string;
  tipoValidacion: { id: string; codigo: string; nombre: string };
  aprobado: boolean;
  observaciones: string | null;
  creadoEn: Date;
}

export interface ChecklistDespachoDetalle {
  id: string;
  completado: boolean;
  completadoPor: UsuarioRef | null;
  fechaCompletado: Date | null;
  observaciones: string | null;
  creadoEn: Date;
  items: ChecklistDespachoItemDetalle[];
}

// ===========================================================================
// EVIDENCIAS
// ===========================================================================

export interface EvidenciaDespachoResumen {
  id: string;
  tipoEvidencia: TipoEvidenciaDespacho;
  rutaArchivo: string | null;
  nombreOriginal: string | null;
  descripcion: string | null;
  creadoPor: UsuarioRef;
  creadoEn: Date;
}

// ===========================================================================
// UBICACION PEDIDO
// ===========================================================================

export interface HistorialUbicacionResumen {
  id: string;
  sede: SedeRef;
  ubicacion: { id: string; nombre: string; codigo: string } | null;
  descripcion: string | null;
  registradoPor: UsuarioRef;
  creadoEn: Date;
}

export interface UbicacionPedidoDetalle {
  id: string;
  pedidoId: string;
  sede: SedeRef;
  ubicacion: { id: string; nombre: string; codigo: string } | null;
  descripcion: string | null;
  actualizadoPor: UsuarioRef;
  ultimaActualizacion: Date;
  historial: HistorialUbicacionResumen[];
}

// ===========================================================================
// DESPACHO
// ===========================================================================

export interface DespachoResumen {
  id: string;
  pedido: { id: string; cliente: { id: string; razonSocial: string } };
  sede: SedeRef;
  estado: EstadoRef;
  encargado: UsuarioRef;
  fechaDespacho: Date;
  observaciones: string | null;
  creadoEn: Date;
}

export interface DespachoDetalle extends DespachoResumen {
  creadoPor: UsuarioRef;
  autorizadoPor: UsuarioRef | null;
  actualizadoEn: Date;
  checklists: ChecklistDespachoDetalle[];
  evidencias: EvidenciaDespachoResumen[];
  ubicacionActual: Omit<UbicacionPedidoDetalle, 'historial'> | null;
}

export interface ListaPaginadaDespachos {
  datos: DespachoResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}
