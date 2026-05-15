import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoSeguimientoPqrs } from '@prisma/client';

export class CrearSeguimientoPqrsDto {
  @IsEnum(TipoSeguimientoPqrs)
  tipoSeguimiento!: TipoSeguimientoPqrs;

  // Mapea a PqrsSeguimiento.descripcion (NOT NULL en schema)
  @IsString()
  @IsNotEmpty()
  observaciones!: string;

  // Mapea a PqrsSeguimiento.observaciones (nullable)
  @IsString()
  @IsOptional()
  notasInternas?: string;
}
