import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

/**
 * DTO base para solicitudes HTTP de cambio de estado.
 * El controlador que lo use debe inyectar modulo, entidad y entidadId
 * desde la ruta o el contexto de autenticación antes de invocar el motor.
 */
export class TransicionarEstadoDto {
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
