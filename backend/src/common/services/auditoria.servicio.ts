import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TipoAccionAuditoria } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';

/**
 * UUID centinela para registros HTTP sin entidad específica identificada.
 * El esquema exige un UUID no-nulo en registroId; este valor indica "sin registro asociado".
 * Es UUID válido para PostgreSQL y semánticamente reconocible como valor nulo intencional.
 */
const UUID_SIN_ENTIDAD = '00000000-0000-0000-0000-000000000000';

export interface DatosRegistroAuditoria {
  /**
   * Tabla afectada. Si no se provee, el servicio usará 'http_request'.
   * En operaciones directas sobre entidades (pedidos, órdenes, etc.), siempre proveer.
   */
  tablaAfectada?: string;
  /**
   * UUID del registro afectado. Si no se provee, se usa UUID_SIN_ENTIDAD.
   * Proveer siempre que la operación afecte un registro específico.
   */
  registroId?: string;
  accion: TipoAccionAuditoria;
  datosAnteriores?: Record<string, unknown> | null;
  datosNuevos?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  usuarioId?: string | null;
  ipOrigen?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditoriaServicio {
  private readonly logger = new Logger(AuditoriaServicio.name);

  constructor(private readonly prisma: PrismaServicio) {}

  /**
   * Escribe un registro en auditoria_general.
   *
   * NUNCA lanza excepciones — captura todos los errores internamente para no
   * interrumpir el flujo principal de negocio. Los fallos solo se reportan como
   * advertencia en el log del servidor.
   */
  async registrarAuditoria(datos: DatosRegistroAuditoria): Promise<void> {
    try {
      await this.prisma.auditoriaGeneral.create({
        data: {
          tablaAfectada: datos.tablaAfectada ?? 'http_request',
          registroId: datos.registroId ?? UUID_SIN_ENTIDAD,
          accion: datos.accion,
          // Record<string, unknown> no es asignable a InputJsonValue en tiempo de compilación,
          // pero es seguro en runtime — los datos son siempre JSON serializable.
          datosAnteriores:
            datos.datosAnteriores != null
              ? (datos.datosAnteriores as unknown as Prisma.InputJsonValue)
              : undefined,
          datosNuevos:
            datos.datosNuevos != null
              ? (datos.datosNuevos as unknown as Prisma.InputJsonValue)
              : undefined,
          metadata:
            datos.metadata != null
              ? (datos.metadata as unknown as Prisma.InputJsonValue)
              : undefined,
          usuarioId: datos.usuarioId ?? undefined,
          ipOrigen: datos.ipOrigen ?? undefined,
          userAgent: datos.userAgent
            ? datos.userAgent.substring(0, 500)
            : undefined,
        },
      });
    } catch (error) {
      this.logger.warn(
        `[AuditoriaServicio] No se pudo registrar auditoría — ${(error as Error)?.message}`,
      );
    }
  }
}
