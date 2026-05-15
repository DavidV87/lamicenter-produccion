import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/** Línea de ítem dentro de una solicitud de compra. */
export class CrearSolicitudCompraItemDto {
  /** Ítem del catálogo a comprar. Debe existir y estar activo. */
  @IsUUID()
  itemId!: string;

  /** Trazabilidad opcional hacia el requerimiento de material que origina esta línea. */
  @IsOptional()
  @IsUUID()
  requerimientoMaterialId?: string;

  /** Cantidad a comprar. Debe ser mayor a cero. */
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @IsPositive()
  cantidadSolicitada!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
