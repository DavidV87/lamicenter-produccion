import {
  IsDateString,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TipoEventoOperativo } from '@prisma/client';

/**
 * DTO para registrar un evento operativo durante la producción.
 *
 * RESTRICCIÓN XOR — exactamente uno debe estar presente (nunca ambos ni ninguno):
 *   - ordenProduccionId
 *   - subordenId
 * Esta validación se aplica en el servicio (Prisma 5 no soporta CHECK constraints).
 *
 * Los eventos operativos son INMUTABLES: no se actualizan ni eliminan.
 */
export class CrearEventoOperativoDto {
  /**
   * ID de la orden de producción afectada por el evento.
   * Exclusivo con subordenId — solo uno puede estar presente.
   */
  @IsOptional()
  @IsUUID()
  ordenProduccionId?: string;

  /**
   * ID de la suborden afectada por el evento.
   * Exclusivo con ordenProduccionId — solo uno puede estar presente.
   */
  @IsOptional()
  @IsUUID()
  subordenId?: string;

  /**
   * Tipo de evento operativo. Controla el significado del registro.
   * Valores: INICIO_ETAPA | FIN_ETAPA | NOVEDAD | REPROCESO | CAMBIO_PRIORIDAD | ASIGNACION_MAQUINA | AUTORIZACION | PAUSA
   */
  @IsEnum(TipoEventoOperativo)
  tipoEvento!: TipoEventoOperativo;

  /** Descripción detallada del evento. Texto libre. */
  @IsString()
  descripcion!: string;

  /**
   * Fecha/hora del evento en formato ISO 8601.
   * Si se omite, se usa la fecha/hora actual del servidor.
   */
  @IsOptional()
  @IsDateString()
  fechaEvento?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
