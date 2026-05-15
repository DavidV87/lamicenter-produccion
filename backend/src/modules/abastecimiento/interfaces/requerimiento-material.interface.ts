import { TipoRequerimiento } from '@prisma/client';

/** Referencia mínima reutilizable (id + nombre). */
interface RefNombre {
  id: string;
  nombre: string;
}

/** Resumen de un requerimiento de material para listados paginados. */
export interface RequerimientoMaterialResumen {
  id: string;
  item: RefNombre;
  sede: RefNombre;
  estado: { id: string; codigo: string; nombre: string };
  tipoRequerimiento: TipoRequerimiento;
  cantidadRequerida: number;
  cantidadAtendida: number;
  fechaRequerida: Date | null;
  observaciones: string | null;
  creadoPor: RefNombre;
  creadoEn: Date;
  actualizadoEn: Date;
}

/** Resultado paginado del listado de requerimientos. */
export interface ListaPaginadaRequerimientos {
  datos: RequerimientoMaterialResumen[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/** Detalle completo de un requerimiento, incluyendo contexto opcional. */
export interface RequerimientoMaterialDetalle extends RequerimientoMaterialResumen {
  cantidadAprobada: number | null;
  pedido: { id: string } | null;
  ordenProduccion: { id: string } | null;
  suborden: { id: string } | null;
  atendidoPor: RefNombre | null;
  metadata: Record<string, unknown> | null;
}
