import { SetMetadata } from '@nestjs/common';
import { TipoAccionAuditoria } from '@prisma/client';

export const AUDITAR_KEY = 'auditar';

export interface OpcionesAuditar {
  /** Nombre de la tabla/entidad afectada. Anula la inferencia automática desde la ruta. */
  entidad?: string;
  /** Acción explícita del enum. Anula la inferencia desde el método HTTP. */
  accion?: TipoAccionAuditoria;
}

/**
 * Enriquece el registro de auditoría con contexto explícito.
 * También activa la auditoría en endpoints GET/HEAD que normalmente se omiten.
 */
export const Auditar = (opciones: OpcionesAuditar) => SetMetadata(AUDITAR_KEY, opciones);
