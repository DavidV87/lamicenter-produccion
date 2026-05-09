import { Injectable } from '@nestjs/common';

/**
 * Servicio raíz de la aplicación.
 * Expone estado básico del servidor; no contiene lógica de negocio.
 */
@Injectable()
export class AplicacionServicio {
  obtenerEstado(): Record<string, string> {
    return {
      estado: 'activo',
      aplicacion: process.env.APP_NAME || 'Lamicenter API',
      version: '0.1.0',
      entorno: process.env.NODE_ENV || 'development',
    };
  }
}
