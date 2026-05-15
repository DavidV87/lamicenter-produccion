import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para cambiar el estado de una solicitud de compra via motor de estados.
 * Módulo: 'solicitud_compra'.
 * Transiciones válidas según seeds: borrador → en_revision → aprobada / rechazada / cancelada.
 */
export class CambiarEstadoSolicitudDto {
  /**
   * Código del estado destino (modulo = 'solicitud_compra').
   * Ejemplos: 'en_revision', 'aprobada', 'rechazada', 'cancelada'.
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
