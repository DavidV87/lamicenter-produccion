import { TipoEventoOperativo } from '@prisma/client';

/** Resumen de una etapa asignada a una orden de producción. */
export interface OrdenEtapaResumen {
  id: string;
  etapaProduccion: {
    id: string;
    nombre: string;
    codigo: string;
    orden: number;
  };
  estadoEtapa: { id: string; codigo: string; nombre: string };
  fechaInicio: Date | null;
  fechaFin: Date | null;
  observaciones: string | null;
  totalAsignaciones: number;
  creadoEn: Date;
}

/** Resumen de una asignación de operador a una etapa. */
export interface AsignacionOrdenResumen {
  id: string;
  ordenEtapaId: string;
  operador: { id: string; nombre: string };
  maquinaId: string | null;
  asignadoPorUsuarioId: string;
  fechaInicioAsignacion: Date;
  fechaFinAsignacion: Date | null;
  motivo: string | null;
  observaciones: string | null;
  creadoEn: Date;
}

/** Resumen de un evento operativo registrado durante la producción. */
export interface EventoOperativoResumen {
  id: string;
  tipoEvento: TipoEventoOperativo;
  descripcion: string;
  registradoPor: { id: string; nombre: string };
  fechaEvento: Date;
  metadata: Record<string, unknown> | null;
  creadoEn: Date;
}

/** Detalle completo de una orden de producción con sus etapas. */
export interface OrdenProduccionDetalle {
  id: string;
  pedido: { id: string };
  sedeProduccion: { id: string; nombre: string };
  sedeActual: { id: string; nombre: string };
  sedeDespacho: { id: string; nombre: string } | null;
  maquinaPrincipal: { id: string; nombre: string; codigo: string } | null;
  estado: { id: string; codigo: string; nombre: string };
  creadoPor: { id: string; nombre: string };
  ordenPrioridad: number;
  generadaAutomaticamente: boolean;
  fechaInicioPlaneada: Date | null;
  fechaFinPlaneada: Date | null;
  fechaInicioReal: Date | null;
  fechaFinReal: Date | null;
  observaciones: string | null;
  metadata: Record<string, unknown> | null;
  etapas: OrdenEtapaResumen[];
  creadoEn: Date;
  actualizadoEn: Date;
}
