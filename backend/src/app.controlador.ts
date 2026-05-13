import { Controller, Get } from '@nestjs/common';
import { AplicacionServicio } from './app.servicio';
import { Publico } from './common/decorators/publico.decorator';

/**
 * Controlador raíz. Solo expone endpoint de salud del servidor.
 */
@Controller()
export class AplicacionControlador {
  constructor(private readonly aplicacionServicio: AplicacionServicio) {}

  @Publico()
  @Get('health')
  verificarSalud(): Record<string, string> {
    return this.aplicacionServicio.obtenerEstado();
  }
}
