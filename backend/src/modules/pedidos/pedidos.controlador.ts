import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PedidosServicio } from './pedidos.servicio';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { ValidarPedidoDto } from './dto/validar-pedido.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Roles } from '../seguridad/auth/decorators/roles.decorador';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { ContextoAuditoria } from '../../common/interfaces/contexto-auditoria.interface';

/** Extiende Request con los campos inyectados por el JWT guard y el interceptor de auditoría */
interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
  auditoriaContexto?: ContextoAuditoria;
}

@Controller('pedidos')
export class PedidosControlador {
  constructor(private readonly pedidosServicio: PedidosServicio) {}

  // ---------------------------------------------------------------------------
  // POST /pedidos — crear pedido con ítems
  // ---------------------------------------------------------------------------

  @Post()
  @Roles('gerente', 'admin_punto', 'vendedor')
  @Permisos('pedidos.crear')
  async crearPedido(
    @Body() dto: CrearPedidoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const pedido = await this.pedidosServicio.crearPedido(dto, req.user);

    // Enriquecer contexto para el interceptor de auditoría
    req.auditoriaContexto = { entidad: 'pedidos', entidadId: pedido.id };

    return respuestaExitosa(pedido, 'Pedido creado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pedidos — listar pedidos con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get()
  @Permisos('pedidos.ver')
  async listarPedidos(
    @Query() query: ListarPedidosQueryDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.pedidosServicio.listarPedidos(query, req.user);
    return respuestaExitosa(resultado, 'Pedidos obtenidos exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pedidos/:id — detalle completo de un pedido
  // ---------------------------------------------------------------------------

  @Get(':id')
  @Permisos('pedidos.ver')
  async obtenerPedido(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const pedido = await this.pedidosServicio.obtenerPedido(id);
    req.auditoriaContexto = { entidad: 'pedidos', entidadId: id };
    return respuestaExitosa(pedido, 'Pedido obtenido exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /pedidos/:id/estado — cambiar estado via motor de estados
  // ---------------------------------------------------------------------------

  @Patch(':id/estado')
  @Permisos('pedidos.cambiar_estado')
  async cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoPedidoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.pedidosServicio.cambiarEstado(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'pedidos', entidadId: id };
    return respuestaExitosa(resultado, 'Estado del pedido actualizado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /pedidos/:id/validar — registrar validación formal del pedido
  // ---------------------------------------------------------------------------

  @Post(':id/validar')
  @Roles('coordinador', 'gerente', 'admin_punto')
  @Permisos('pedidos.autorizar')
  async validarPedido(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ValidarPedidoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const validacion = await this.pedidosServicio.validarPedido(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'validaciones_pedido', entidadId: validacion.id };
    return respuestaExitosa(validacion, 'Validación de pedido registrada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pedidos/:id/historial — historial de estados del pedido
  // ---------------------------------------------------------------------------

  @Get(':id/historial')
  @Permisos('pedidos.ver')
  async obtenerHistorial(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const historial = await this.pedidosServicio.obtenerHistorial(id);
    req.auditoriaContexto = { entidad: 'pedidos', entidadId: id };
    return respuestaExitosa(historial, 'Historial de estados obtenido exitosamente');
  }
}
