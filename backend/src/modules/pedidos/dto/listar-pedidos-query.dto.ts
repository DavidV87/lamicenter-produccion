import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class ListarPedidosQueryDto {
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
  clienteId?: string;

  /** Filtra por sedeVentaId o sedeResponsableId */
  @IsOptional()
  @IsUUID()
  sedeId?: string;

  @IsOptional()
  @IsUUID()
  vendedorId?: string;

  @IsOptional()
  @IsUUID()
  estadoId?: string;

  /** Búsqueda libre por razonSocial del cliente */
  @IsOptional()
  @IsString()
  busqueda?: string;
}
