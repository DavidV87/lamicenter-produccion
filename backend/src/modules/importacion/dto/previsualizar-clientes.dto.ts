import { IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

/**
 * DTO para previsualización de clientes desde Excel.
 * Las filas se reciben como objetos sin tipo estricto para permitir
 * validación por-fila en el servicio (retorna errores por fila, no 400 global).
 * NO usa @ValidateNested para evitar que una fila inválida rechace toda la solicitud.
 */
export class PrevisualizarClientesDto {
  @IsArray({ message: 'filas debe ser un arreglo' })
  @ArrayMinSize(1, { message: 'Se requiere al menos una fila para previsualizar' })
  @ArrayMaxSize(500, { message: 'No se pueden previsualizar más de 500 filas a la vez' })
  filas!: Record<string, unknown>[];
}
