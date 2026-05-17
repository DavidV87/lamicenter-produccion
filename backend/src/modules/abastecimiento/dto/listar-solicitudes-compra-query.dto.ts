import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

/** Query params para listar solicitudes de compra con filtros y paginación. */
export class ListarSolicitudesCompraQueryDto {
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
  sedeId?: string;

  @IsOptional()
  @IsUUID()
  proveedorId?: string;

  /** Filtrar por ID de estado (UUID del EstadoSistema). */
  @IsOptional()
  @IsUUID()
  estadoId?: string;

  /** Búsqueda libre por observaciones o razón social del proveedor. */
  @IsOptional()
  @IsString()
  busqueda?: string;
}
