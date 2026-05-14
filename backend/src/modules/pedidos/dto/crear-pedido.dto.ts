import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CrearPedidoItemDto } from './crear-pedido-item.dto';

export class CrearPedidoDto {
  @IsUUID()
  sedeVentaId!: string;

  @IsUUID()
  sedeResponsableId!: string;

  @IsOptional()
  @IsUUID()
  sedeDespachoId?: string;

  @IsUUID()
  clienteId!: string;

  @IsOptional()
  @IsUUID()
  vendedorId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observaciones?: string;

  /**
   * Fecha prometida de entrega al cliente.
   * No existe como columna en pedidos; se persiste en metadata.fechaEntregaPrometida.
   */
  @IsOptional()
  @IsDateString()
  fechaEntregaPrometida?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPedidoItemDto)
  items!: CrearPedidoItemDto[];
}
