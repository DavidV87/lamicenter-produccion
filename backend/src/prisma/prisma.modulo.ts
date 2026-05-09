import { Global, Module } from '@nestjs/common';
import { PrismaServicio } from './prisma.servicio';

/**
 * Módulo Prisma declarado global.
 * PrismaServicio queda disponible en toda la aplicación sin importaciones adicionales.
 */
@Global()
@Module({
  providers: [PrismaServicio],
  exports: [PrismaServicio],
})
export class PrismaModulo {}
