import { Module } from '@nestjs/common';
import { AbastecimientoControlador } from './abastecimiento.controlador';
import { AbastecimientoServicio } from './abastecimiento.servicio';
import { MotorEstadosModulo } from '../../common/motor-estados/motor-estados.modulo';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';

/**
 * Módulo Abastecimiento V1 — requerimientos de material y solicitudes de compra.
 * Bloque 6 del sistema Lamicenter (parcial: compras, recepciones y traslados en V2).
 */
@Module({
  imports:     [MotorEstadosModulo],
  controllers: [AbastecimientoControlador],
  providers:   [AbastecimientoServicio, AuditoriaServicio],
  exports:     [AbastecimientoServicio],
})
export class AbastecimientoModulo {}
