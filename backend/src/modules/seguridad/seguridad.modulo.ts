import { Module } from '@nestjs/common';
import { AuthModulo } from './auth/auth.modulo';

/**
 * Módulo Seguridad — agrupa autenticación, autorización, usuarios y roles.
 * Exporta AuthModulo para que sus servicios estén disponibles si otros módulos lo necesitan.
 */
@Module({
  imports: [AuthModulo],
  exports: [AuthModulo],
})
export class SeguridadModulo {}
