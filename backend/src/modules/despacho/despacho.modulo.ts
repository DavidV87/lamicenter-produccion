import { Module } from '@nestjs/common';
import { DespachoControlador } from './despacho.controlador';
import { DespachoServicio } from './despacho.servicio';
import { MotorEstadosModulo } from '../../common/motor-estados/motor-estados.modulo';

@Module({
  imports:     [MotorEstadosModulo],
  controllers: [DespachoControlador],
  providers:   [DespachoServicio],
  exports:     [DespachoServicio],
})
export class DespachoModulo {}
