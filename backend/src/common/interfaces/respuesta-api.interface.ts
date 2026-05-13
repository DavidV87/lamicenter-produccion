export interface RespuestaApi<T = unknown> {
  exito: boolean;
  mensaje: string;
  datos?: T;
  errores?: string[];
  marca: string;
}
