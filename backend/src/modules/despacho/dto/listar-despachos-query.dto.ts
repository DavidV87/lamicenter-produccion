import { IsDateString, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ListarDespachosQueryDto {
  @IsOptional()
  @IsUUID()
  pedidoId?: string;

  @IsOptional()
  @IsUUID()
  estadoDespachoId?: string;

  @IsOptional()
  @IsUUID()
  encargadoDespachoId?: string;

  @IsOptional()
  @IsUUID()
  sedeSalidaId?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limite?: number;
}
