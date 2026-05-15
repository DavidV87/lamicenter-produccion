import { Module } from '@nestjs/common';
import { PqrsControlador } from './pqrs.controlador';
import { PqrsServicio } from './pqrs.servicio';
import { MotorEstadosModulo } from '../../common/motor-estados/motor-estados.modulo';

@Module({
  imports:     [MotorEstadosModulo],
  controllers: [PqrsControlador],
  providers:   [PqrsServicio],
  exports:     [PqrsServicio],
})
export class PqrsModulo {}
