import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { DestinoOperativo } from '@prisma/client';

export class CrearPedidoItemDto {
  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsUUID()
  facturaItemId?: string;

  @IsString()
  @MaxLength(500)
  descripcion!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  cantidad!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  cantidadTotal!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidadParaProduccion!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidadParaDespachoEntero!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioUnitario?: number;

  @IsEnum(DestinoOperativo)
  destinoOperativo!: DestinoOperativo;

  @IsOptional()
  @IsBoolean()
  esMaterialCliente?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
