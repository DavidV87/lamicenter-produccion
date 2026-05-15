import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ListarPqrsQueryDto {
  @IsUUID()
  @IsOptional()
  clienteId?: string;

  @IsUUID()
  @IsOptional()
  estadoPqrsId?: string;

  @IsUUID()
  @IsOptional()
  tipoNovedadId?: string;

  @IsUUID()
  @IsOptional()
  pedidoId?: string;

  @IsString()
  @IsOptional()
  busqueda?: string;

  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean()
  @IsOptional()
  generaReproceso?: boolean;

  @IsString()
  @IsOptional()
  fechaDesde?: string;

  @IsString()
  @IsOptional()
  fechaHasta?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pagina?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limite?: number = 20;
}
