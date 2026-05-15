import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CrearDespachoDto {
  @IsUUID()
  pedidoId!: string;

  @IsUUID()
  sedeSalidaId!: string;

  /** Usuario que ejecutará físicamente el despacho. Si se omite, se usa el usuario en sesión. */
  @IsOptional()
  @IsUUID()
  encargadoDespachoId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  /** Fecha programada del despacho en ISO 8601. Si se omite, se registra la fecha actual. */
  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;
}
