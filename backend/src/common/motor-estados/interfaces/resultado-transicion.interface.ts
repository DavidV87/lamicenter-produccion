/**
 * Resultado devuelto por el motor de estados tras ejecutar una transición exitosa.
 * Los campos "anterior" son nulos cuando la entidad no tenía estado previo (transición inicial).
 */
export interface ResultadoTransicion {
  entidadId: string;
  estadoAnteriorId: string | null;
  estadoAnteriorCodigo: string | null;
  estadoAnteriorNombre: string | null;
  estadoNuevoId: string;
  estadoNuevoCodigo: string;
  estadoNuevoNombre: string;
}
