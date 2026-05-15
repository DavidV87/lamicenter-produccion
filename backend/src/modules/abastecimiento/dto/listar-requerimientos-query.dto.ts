import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

/** Query params para listar requerimientos de material con filtros y paginación. */
export class ListarRequerimientosQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limite?: number;

  @IsOptional()
  @IsUUID()
  itemId?: string;

  @IsOptional()
  @IsUUID()
  sedeId?: string;

  @IsOptional()
  @IsUUID()
  pedidoId?: string;

  @IsOptional()
  @IsUUID()
  ordenProduccionId?: string;

  /** Filtrar por ID de estado (UUID del EstadoSistema). */
  @IsOptional()
  @IsUUID()
  estadoId?: string;
}
