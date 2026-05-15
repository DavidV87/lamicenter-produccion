import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CambiarEstadoPqrsDto {
  @IsString()
  estadoNuevoCodigo!: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  forzar?: boolean;
}
