import { IsOptional, IsUUID } from 'class-validator';

/**
 * Query params para endpoints del dashboard.
 * sedeId opcional: restringe las métricas a una sede específica.
 * Sin sedeId se incluyen todas las sedes.
 */
export class DashboardQueryDto {
  @IsOptional()
  @IsUUID()
  sedeId?: string;
}
