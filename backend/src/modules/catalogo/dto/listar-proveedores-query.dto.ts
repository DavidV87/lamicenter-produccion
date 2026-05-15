import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoProveedor } from '@prisma/client';

export class ListarProveedoresQueryDto {
  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : undefined))
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsEnum(TipoProveedor)
  tipoProveedor?: TipoProveedor;

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
