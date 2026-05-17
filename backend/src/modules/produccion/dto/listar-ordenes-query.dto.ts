import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

/** Query params para listar órdenes de producción con filtros y paginación. */
export class ListarOrdenesQueryDto {
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

  /** Filtrar por pedido padre. */
  @IsOptional()
  @IsUUID()
  pedidoId?: string;

  /** Filtrar por sede de producción. */
  @IsOptional()
  @IsUUID()
  sedeProduccionId?: string;

  /** Filtrar por ID de estado (usar el UUID, no el código). */
  @IsOptional()
  @IsUUID()
  estadoOrdenId?: string;

  /** Búsqueda libre por observaciones o consecutivo del pedido. */
  @IsOptional()
  @IsString()
  busqueda?: string;
}
