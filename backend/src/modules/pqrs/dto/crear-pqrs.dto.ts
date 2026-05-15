import {
  IsBoolean,
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CrearPqrsDto {
  @IsUUID()
  @IsNotEmpty()
  clienteId!: string;

  @IsUUID()
  @IsOptional()
  pedidoId?: string;

  @IsUUID()
  @IsOptional()
  facturaId?: string;

  @IsUUID()
  @IsOptional()
  ordenProduccionId?: string;

  @IsUUID()
  @IsOptional()
  subordenId?: string;

  @IsUUID()
  @IsOptional()
  pedidoItemId?: string;

  @IsUUID()
  @IsNotEmpty()
  tipoNovedadId!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @IsBoolean()
  @IsOptional()
  generaReproceso?: boolean;

  // Requerido cuando generaReproceso=true (al menos uno de los dos)
  @ValidateIf((o) => o.generaReproceso === true && !o.reprocesoId)
  @IsUUID()
  @IsNotEmpty()
  novedadOperativaId?: string;

  @ValidateIf((o) => o.generaReproceso === true && !o.novedadOperativaId)
  @IsUUID()
  @IsNotEmpty()
  reprocesoId?: string;

  @IsUUID()
  @IsOptional()
  responsableSolucionId?: string;

  @IsDecimal()
  @IsOptional()
  costoEstimado?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
