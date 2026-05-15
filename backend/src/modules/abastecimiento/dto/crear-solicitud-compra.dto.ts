import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CrearSolicitudCompraItemDto } from './crear-solicitud-compra-item.dto';

/**
 * DTO para crear una solicitud de compra con sus líneas de ítems.
 * Nace en estado inicial 'borrador' del módulo 'solicitud_compra'.
 * El código único (SC-YYYYMMDD-XXXXXX) se genera automáticamente en el servicio.
 */
export class CrearSolicitudCompraDto {
  /** Sede que genera la solicitud. Debe existir y estar activa. */
  @IsUUID()
  sedeId!: string;

  /** Proveedor al que se dirige la solicitud. Nullable en creación, se define antes de aprobar. */
  @IsOptional()
  @IsUUID()
  proveedorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  /** Al menos un ítem es requerido. */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CrearSolicitudCompraItemDto)
  items!: CrearSolicitudCompraItemDto[];
}
