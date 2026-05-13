import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Servicio Prisma global.
 * Se conecta al iniciar el módulo y se desconecta al destruirlo.
 * Declarado @Global en PrismaModulo — no necesita importarse en cada módulo.
 */
@Injectable()
export class PrismaServicio extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaServicio.name);

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conexión a PostgreSQL establecida');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Conexión a PostgreSQL cerrada');
  }

  /**
   * Envuelve una operación en una transacción Prisma interactiva.
   *
   * Usar obligatoriamente para toda escritura múltiple crítica que requiera atomicidad:
   *   - cambio de estado + historial_estados + auditoria_general
   *   - despacho + despacho_items
   *   - reproceso + novedad_operativa
   *   - ubicacion_pedido + historial_ubicacion_pedido
   *   - cualquier par de tablas que deban quedar consistentes o fallar juntas
   *
   * Ejemplo de uso:
   *   await this.prisma.ejecutarTransaccion(async (tx) => {
   *     await tx.pedido.update({ ... });
   *     await tx.historialEstadoPedido.create({ ... });
   *     await tx.auditoriaGeneral.create({ ... });
   *   });
   */
  async ejecutarTransaccion<T>(
    fn: (prisma: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }
}
