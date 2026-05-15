import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para cambiar el estado de un requerimiento de material via motor de estados.
 * Módulo: 'requerimiento_material'.
 * Transiciones válidas según seeds: pendiente → en_revision → aprobado / rechazado → atendido / cancelado.
 */
export class CambiarEstadoRequerimientoDto {
  /**
   * Código del estado destino (modulo = 'requerimiento_material').
   * Ejemplos: 'en_revision', 'aprobado', 'rechazado', 'atendido', 'cancelado'.
   */
  @IsString()
  @MaxLength(80)
  estadoNuevoCodigo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  /** Si true, fuerza la transición omitiendo validación de arcos. Solo para gerente/admin_punto. */
  @IsOptional()
  @IsBoolean()
  forzar?: boolean;
}
