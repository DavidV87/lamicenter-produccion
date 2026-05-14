import { Module } from '@nestjs/common';
import { MotorEstadosServicio } from './motor-estados.servicio';

/**
 * Módulo del motor de estados centralizado.
 *
 * Importar este módulo en cualquier módulo de dominio que necesite
 * ejecutar transiciones de estado:
 *
 *   @Module({
 *     imports: [MotorEstadosModulo],
 *     ...
 *   })
 *   export class PedidosModulo {}
 *
 * PrismaServicio no necesita importarse — está declarado @Global en PrismaModulo.
 */
@Module({
  providers: [MotorEstadosServicio],
  exports: [MotorEstadosServicio],
})
export class MotorEstadosModulo {}
