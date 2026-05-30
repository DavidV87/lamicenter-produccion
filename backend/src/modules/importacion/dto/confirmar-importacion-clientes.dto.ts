import { IsArray, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';
import { FilaClienteDto } from './fila-cliente.dto';

/**
 * DTO para confirmar importación de clientes.
 * Usa validación estricta por fila: el frontend debe enviar únicamente
 * filas marcadas como 'valido' en la previsualización.
 */
export class ConfirmarImportacionClientesDto {
  @IsArray({ message: 'filas debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Se requiere al menos una fila para importar' })
  @ArrayMaxSize(500, { message: 'No se pueden importar más de 500 filas a la vez' })
  @ValidateNested({ each: true })
  @Type(() => FilaClienteDto)
  filas!: FilaClienteDto[];
}
