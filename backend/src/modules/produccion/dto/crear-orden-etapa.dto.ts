import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO para agregar una etapa a una orden de producción.
 * La etapa nace en estado 'pendiente' del módulo 'etapa_produccion' si no se especifica otro.
 *
 * IMPORTANTE — restricción XOR en BD:
 *   La tabla orden_etapas exige que exactamente uno de (orden_produccion_id, suborden_id) sea NOT NULL.
 *   Este endpoint siempre asigna ordenProduccionId (tomado del path :id). subordenId queda nulo.
 */
export class CrearOrdenEtapaDto {
  /** ID del catálogo de etapas de producción (ej: CORTE, ENCHAPE, PERFORACION). */
  @IsUUID()
  etapaProduccionId!: string;

  /**
   * Código del estado inicial para la etapa. Si se omite, se usa 'pendiente'.
   * Debe existir en estados_sistema con modulo = 'etapa_produccion'.
   */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  estadoEtapaCodigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
