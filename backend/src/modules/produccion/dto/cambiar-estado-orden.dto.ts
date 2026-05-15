import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * DTO para cambiar el estado de una orden de producción via el motor de estados.
 * La transición debe existir en transiciones_estado o el usuario debe tener rol
 * habilitado para forzar (gerente / admin_punto).
 */
export class CambiarEstadoOrdenDto {
  /**
   * Código del estado destino según estados_sistema (modulo = 'orden_produccion').
   * Ejemplos: 'validada', 'en_cola', 'en_corte', 'corte_terminado', 'terminada', 'cancelada'.
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

  /**
   * Si true, fuerza la transición omitiendo validación de arcos.
   * Solo permitido para roles gerente y admin_punto.
   */
  @IsOptional()
  @IsBoolean()
  forzar?: boolean;
}
