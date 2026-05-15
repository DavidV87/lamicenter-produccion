import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO para asignar un operador (y opcionalmente una máquina) a una etapa de la orden.
 *
 * Regla de reasignación:
 *   Al crear una nueva asignación, se cierra la asignación activa anterior
 *   (la que tenga fechaFinAsignacion IS NULL) poniendo fechaFinAsignacion = ahora.
 *   NO se sobrescribe el registro anterior — se preserva el historial completo.
 */
export class AsignarOrdenEtapaDto {
  /** ID del usuario operador que ejecutará la etapa. Debe existir y estar activo. */
  @IsUUID()
  operadorId!: string;

  /** Máquina asignada para esta etapa. Nullable si la etapa no requiere máquina específica. */
  @IsOptional()
  @IsUUID()
  maquinaId?: string;

  /**
   * Fecha de inicio de la asignación en formato ISO 8601.
   * Si se omite, se usa la fecha/hora actual del servidor.
   */
  @IsOptional()
  @IsDateString()
  fechaInicioAsignacion?: string;

  /** Motivo de la asignación o reasignación (ej: "Cambio de turno", "Operario más idóneo"). */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  motivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
