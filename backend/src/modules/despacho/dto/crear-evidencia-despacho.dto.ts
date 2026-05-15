import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TipoEvidenciaDespacho } from '@prisma/client';

export class CrearEvidenciaDespachoDto {
  @IsEnum(TipoEvidenciaDespacho)
  tipoEvidencia!: TipoEvidenciaDespacho;

  /** Nombre original del archivo tal como lo subió el usuario. */
  @IsOptional()
  @IsString()
  @MaxLength(255)
  nombreArchivo?: string;

  /** Ruta interna del archivo físico. Requerido para tipos distintos de OBSERVACION. */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rutaArchivo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
