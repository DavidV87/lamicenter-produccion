import { Module } from '@nestjs/common';
import { PedidosControlador } from './pedidos.controlador';
import { PedidosServicio } from './pedidos.servicio';
import { MotorEstadosModulo } from '../../common/motor-estados/motor-estados.modulo';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';

@Module({
  imports: [MotorEstadosModulo],
  controllers: [PedidosControlador],
  providers: [PedidosServicio, AuditoriaServicio],
  exports: [PedidosServicio],
})
export class PedidosModulo {}
