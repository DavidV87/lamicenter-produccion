import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CambiarEstadoPedidoDto {
  @IsString()
  @MaxLength(80)
  estadoNuevoCodigo!: string;

  @IsOptional()
  @IsUUID()
  autorizadorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  forzar?: boolean;
}
