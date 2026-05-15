import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO para crear una orden de producción manual.
 * La orden nace en el estado inicial 'creada' del módulo 'orden_produccion'.
 * generadaAutomaticamente queda en false — la generación automática no está implementada en V1.
 */
export class CrearOrdenProduccionDto {
  /** ID del pedido al que pertenece esta orden. Debe existir en BD. */
  @IsUUID()
  pedidoId!: string;

  /** Sede donde se ejecuta físicamente la producción. */
  @IsUUID()
  sedeProduccionId!: string;

  /** Sede donde se encuentra la orden actualmente (por lo general igual a sedeProduccion al inicio). */
  @IsUUID()
  sedeActualId!: string;

  /** Sede desde donde saldrá el producto terminado. Nullable si aún no se define. */
  @IsOptional()
  @IsUUID()
  sedeDespachoId?: string;

  /** Máquina CNC principal asignada. Nullable si aún no se asigna. */
  @IsOptional()
  @IsUUID()
  maquinaPrincipalId?: string;

  /** Orden en la cola de producción. Menor valor = mayor urgencia. Por defecto 0. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  ordenPrioridad?: number;

  /** Fecha de inicio planeada en formato ISO 8601 (YYYY-MM-DD o datetime). */
  @IsOptional()
  @IsDateString()
  fechaInicioPlaneada?: string;

  /** Fecha de fin planeada en formato ISO 8601 (YYYY-MM-DD o datetime). */
  @IsOptional()
  @IsDateString()
  fechaFinPlaneada?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
