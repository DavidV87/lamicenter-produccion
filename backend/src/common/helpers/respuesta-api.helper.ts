import { RespuestaApi } from '../interfaces/respuesta-api.interface';

export function respuestaExitosa<T>(datos: T, mensaje = 'Operación exitosa'): RespuestaApi<T> {
  return { exito: true, mensaje, datos, marca: new Date().toISOString() };
}

export function respuestaError(mensaje: string, errores?: string[]): RespuestaApi<null> {
  return { exito: false, mensaje, errores, datos: null, marca: new Date().toISOString() };
}
