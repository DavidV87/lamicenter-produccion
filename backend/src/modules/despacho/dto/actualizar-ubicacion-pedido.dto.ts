import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ActualizarUbicacionPedidoDto {
  @IsUUID()
  sedeId!: string;

  /** Espacio físico específico dentro de la sede. Si se omite, la sede es suficiente. */
  @IsOptional()
  @IsUUID()
  ubicacionId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;
}
