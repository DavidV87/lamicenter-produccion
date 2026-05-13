import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Captura todas las excepciones no controladas y devuelve una respuesta
 * homogénea en formato RespuestaApi para que el frontend siempre reciba
 * la misma estructura independientemente del error.
 */
@Catch()
export class FiltroExcepcionesGlobal implements ExceptionFilter {
  private readonly logger = new Logger(FiltroExcepcionesGlobal.name);

  catch(excepcion: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const respuesta = ctx.getResponse<Response>();
    const solicitud = ctx.getRequest<Request>();

    let estadoHttp = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor';
    let errores: string[] | undefined;

    if (excepcion instanceof HttpException) {
      estadoHttp = excepcion.getStatus();
      const cuerpo = excepcion.getResponse();

      if (typeof cuerpo === 'string') {
        mensaje = cuerpo;
      } else if (typeof cuerpo === 'object' && cuerpo !== null) {
        const obj = cuerpo as Record<string, unknown>;
        if (Array.isArray(obj.message)) {
          errores = obj.message as string[];
          mensaje = 'Error de validación';
        } else {
          mensaje = (obj.message as string) || mensaje;
        }
      }
    } else if (excepcion instanceof Error) {
      mensaje = excepcion.message;
    }

    if (estadoHttp >= 500) {
      this.logger.error(
        `${solicitud.method} ${solicitud.url} — ${mensaje}`,
        (excepcion as Error)?.stack,
      );
    }

    respuesta.status(estadoHttp).json({
      exito: false,
      mensaje,
      errores,
      datos: null,
      marca: new Date().toISOString(),
    });
  }
}
