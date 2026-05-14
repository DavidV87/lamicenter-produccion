import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { EstadoValidacionPedido } from '@prisma/client';

export class DetalleValidacionDto {
  @IsString()
  @MaxLength(150)
  tipoVerificacion!: string;

  @IsBoolean()
  aprobado!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}

export class ValidarPedidoDto {
  @IsEnum(EstadoValidacionPedido)
  estadoValidacion!: EstadoValidacionPedido;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DetalleValidacionDto)
  detalles?: DetalleValidacionDto[];
}
