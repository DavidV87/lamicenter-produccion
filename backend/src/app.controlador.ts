import { Controller, Get } from '@nestjs/common';
import { AplicacionServicio } from './app.servicio';

/**
 * Controlador raíz. Solo expone endpoint de salud del servidor.
 */
@Controller()
export class AplicacionControlador {
  constructor(private readonly aplicacionServicio: AplicacionServicio) {}

  @Get('health')
  verificarSalud(): Record<string, string> {
    return this.aplicacionServicio.obtenerEstado();
  }
}
