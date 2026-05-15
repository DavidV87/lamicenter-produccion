import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { TipoRequerimiento } from '@prisma/client';

/**
 * DTO para crear un requerimiento de material.
 * Nace en estado inicial 'pendiente' del módulo 'requerimiento_material'.
 *
 * Contexto opcional: un requerimiento puede asociarse a pedido, orden
 * o suborden para mantener trazabilidad. Las tres referencias son opcionales.
 */
export class CrearRequerimientoMaterialDto {
  /** Ítem de catálogo que se requiere. Debe existir y estar activo. */
  @IsUUID()
  itemId!: string;

  /** Sede que realiza el requerimiento. Debe existir y estar activa. */
  @IsUUID()
  sedeId!: string;

  /** Cantidad requerida. Debe ser mayor a cero. */
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  cantidadRequerida!: number;

  /** Pedido al que aplica el requerimiento. Opcional. */
  @IsOptional()
  @IsUUID()
  pedidoId?: string;

  /** Orden de producción que genera el requerimiento. Opcional. */
  @IsOptional()
  @IsUUID()
  ordenProduccionId?: string;

  /** Suborden que genera el requerimiento. Opcional. */
  @IsOptional()
  @IsUUID()
  subordenId?: string;

  /**
   * Tipo de requerimiento según su naturaleza operativa.
   * Si se omite, se usa GENERAL.
   * Valores: PRODUCCION | COMPRA | TRASLADO | RESERVA | GENERAL
   */
  @IsOptional()
  @IsEnum(TipoRequerimiento)
  tipoRequerimiento?: TipoRequerimiento;

  /** Fecha en que se necesita el material (YYYY-MM-DD). */
  @IsOptional()
  @IsDateString()
  fechaNecesaria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
