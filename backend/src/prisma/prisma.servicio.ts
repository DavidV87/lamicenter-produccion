import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

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
}
