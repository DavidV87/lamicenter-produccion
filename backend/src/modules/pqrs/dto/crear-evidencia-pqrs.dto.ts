import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { TipoEvidenciaPqrs } from '@prisma/client';

export class CrearEvidenciaPqrsDto {
  @IsEnum(TipoEvidenciaPqrs)
  tipoEvidencia!: TipoEvidenciaPqrs;

  // Mapea a PqrsEvidencia.nombreOriginal
  @IsString()
  @IsOptional()
  nombreArchivo?: string;

  // Requerido para FOTO y DOCUMENTO; opcional para OBSERVACION
  @ValidateIf((o) => o.tipoEvidencia !== TipoEvidenciaPqrs.OBSERVACION)
  @IsString()
  @IsNotEmpty()
  rutaArchivo?: string;

  // Mapea a PqrsEvidencia.descripcion
  @IsString()
  @IsOptional()
  observaciones?: string;
}
