import { Body, Controller, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ImportacionClientesServicio } from './importacion-clientes.servicio';
import { PrevisualizarClientesDto } from './dto/previsualizar-clientes.dto';
import { ConfirmarImportacionClientesDto } from './dto/confirmar-importacion-clientes.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import {
  ResumenPreviewClientes,
  ResultadoConfirmarClientes,
} from './interfaces/importacion.interfaces';

interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
}

@Controller('importacion')
export class ImportacionControlador {
  constructor(
    private readonly importacionClientesServicio: ImportacionClientesServicio,
  ) {}

  /**
   * Previsualiza un lote de filas de clientes desde Excel.
   * Clasifica cada fila sin escribir en BD.
   *
   * Payload: { "filas": [ { "razonSocial": "...", "identificacion": "...", "tipoIdentificacion": "NIT", ... } ] }
   */
  @Post('clientes/previsualizar')
  @Permisos('catalogo.crear')
  async previsualizarClientes(
    @Body() dto: PrevisualizarClientesDto,
    @Req() _req: SolicitudConUsuario,
  ): Promise<RespuestaApi<ResumenPreviewClientes>> {
    const resultado = await this.importacionClientesServicio.previsualizar(dto);
    return respuestaExitosa(resultado, 'Previsualización completada');
  }

  /**
   * Confirma la importación de filas válidas de clientes.
   * Solo recibe filas marcadas como 'valido' en la previsualización.
   *
   * Payload: { "filas": [ { "razonSocial": "...", "identificacion": "...", "tipoIdentificacion": "NIT" } ] }
   */
  @Post('clientes/confirmar')
  @Permisos('catalogo.crear')
  async confirmarClientes(
    @Body() dto: ConfirmarImportacionClientesDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<ResultadoConfirmarClientes>> {
    const resultado = await this.importacionClientesServicio.confirmar(dto, req.user);
    return respuestaExitosa(
      resultado,
      `Importación completada: ${resultado.creados} creados, ${resultado.omitidos} omitidos`,
    );
  }
}
