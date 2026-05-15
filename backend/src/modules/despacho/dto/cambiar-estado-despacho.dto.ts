import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CambiarEstadoDespachoDto {
  @IsString()
  estadoNuevoCodigo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  /** Solo disponible para gerente y admin_punto. Salta la validación de arcos. */
  @IsOptional()
  @IsBoolean()
  forzar?: boolean;
}
