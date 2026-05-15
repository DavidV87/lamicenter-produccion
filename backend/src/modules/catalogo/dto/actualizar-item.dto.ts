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
import { Type } from 'class-transformer';
import { UnidadMedida } from '@prisma/client';

export class ActualizarItemDto {
  @IsOptional()
  @IsUUID()
  tipoItemId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  codigo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidadMedida?: UnidadMedida;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  precioVentaReferencia?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  costoReferencia?: number;

  @IsOptional()
  @IsBoolean()
  controlaInventario?: boolean;

  @IsOptional()
  @IsBoolean()
  requiereCorte?: boolean;

  @IsOptional()
  @IsBoolean()
  permiteFraccion?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
