import { Module } from '@nestjs/common';
import { ReportesControlador } from './reportes.controlador';
import { ReportesServicio } from './reportes.servicio';

/**
 * ReportesModulo — consultas read-only agregadas de todos los módulos del sistema.
 * PrismaServicio está disponible globalmente (PrismaModulo es @Global).
 * No importa otros módulos de dominio; solo consulta la BD directamente.
 */
@Module({
  controllers: [ReportesControlador],
  providers:   [ReportesServicio],
  exports:     [ReportesServicio],
})
export class ReportesModulo {}
