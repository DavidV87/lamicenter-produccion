import { TipoAccionAuditoria } from '@prisma/client';

/**
 * Contexto de auditoría enriquecido que los servicios pueden inyectar en el request
 * durante la ejecución del handler, antes de que el interceptor escriba el registro.
 *
 * Uso desde un servicio:
 *   req.auditoriaContexto = { entidadId: pedido.id, entidad: 'pedidos' };
 */
export interface ContextoAuditoria {
  entidad?: string;
  entidadId?: string;
  accion?: TipoAccionAuditoria;
  metadata?: Record<string, unknown>;
}
