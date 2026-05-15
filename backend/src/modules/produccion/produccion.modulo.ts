import { Module } from '@nestjs/common';
import { ProduccionControlador } from './produccion.controlador';
import { ProduccionServicio } from './produccion.servicio';
import { MotorEstadosModulo } from '../../common/motor-estados/motor-estados.modulo';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';

/**
 * Módulo Producción V1 — órdenes de producción, etapas, asignaciones y eventos.
 * Bloque 5 del sistema Lamicenter.
 */
@Module({
  imports:     [MotorEstadosModulo],
  controllers: [ProduccionControlador],
  providers:   [ProduccionServicio, AuditoriaServicio],
  exports:     [ProduccionServicio],
})
export class ProduccionModulo {}
