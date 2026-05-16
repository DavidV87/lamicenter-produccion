import { IsDateString, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query params para endpoints de reportes con filtro de rango de fechas.
 * Todos los campos son opcionales; sin filtros devuelve todos los registros.
 *
 * Reglas:
 *  - fechaDesde/fechaHasta: ISO 8601 (YYYY-MM-DD o con hora)
 *  - sedeId: filtra según el campo de sede principal de cada entidad
 *  - limite: cap al número de registros devueltos; máximo 100, defecto 20
 */
export class RangoFechasQueryDto {
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsUUID()
  sedeId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;
}
