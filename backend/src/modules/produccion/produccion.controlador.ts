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
import { ProduccionServicio } from './produccion.servicio';
import { CrearOrdenProduccionDto } from './dto/crear-orden-produccion.dto';
import { ListarOrdenesQueryDto } from './dto/listar-ordenes-query.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { CrearOrdenEtapaDto } from './dto/crear-orden-etapa.dto';
import { AsignarOrdenEtapaDto } from './dto/asignar-orden-etapa.dto';
import { CrearEventoOperativoDto } from './dto/crear-evento-operativo.dto';
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

@Controller('produccion')
export class ProduccionControlador {
  constructor(private readonly produccionServicio: ProduccionServicio) {}

  // ---------------------------------------------------------------------------
  // POST /produccion/ordenes — crear orden de producción
  // ---------------------------------------------------------------------------

  @Post('ordenes')
  @Roles('coordinador', 'produccion', 'gerente')
  @Permisos('produccion.crear')
  async crearOrden(
    @Body() dto: CrearOrdenProduccionDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const orden = await this.produccionServicio.crearOrden(dto, req.user);

    // Enriquecer contexto para el interceptor de auditoría
    req.auditoriaContexto = { entidad: 'ordenes_produccion', entidadId: orden.id };

    return respuestaExitosa(orden, 'Orden de producción creada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /produccion/ordenes — listar órdenes con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get('ordenes')
  @Permisos('produccion.ver')
  async listarOrdenes(
    @Query() query: ListarOrdenesQueryDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.produccionServicio.listarOrdenes(query, req.user);
    return respuestaExitosa(resultado, 'Órdenes de producción obtenidas exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /produccion/ordenes/:id — detalle completo de una orden
  // ---------------------------------------------------------------------------

  @Get('ordenes/:id')
  @Permisos('produccion.ver')
  async obtenerOrden(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const orden = await this.produccionServicio.obtenerOrden(id);
    req.auditoriaContexto = { entidad: 'ordenes_produccion', entidadId: id };
    return respuestaExitosa(orden, 'Orden de producción obtenida exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /produccion/ordenes/:id/estado — cambiar estado via motor de estados
  // ---------------------------------------------------------------------------

  @Patch('ordenes/:id/estado')
  @Permisos('produccion.cambiar_estado')
  async cambiarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoOrdenDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.produccionServicio.cambiarEstadoOrden(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'ordenes_produccion', entidadId: id };
    return respuestaExitosa(resultado, 'Estado de la orden actualizado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /produccion/ordenes/:id/etapas — agregar etapa a la orden
  // ---------------------------------------------------------------------------

  @Post('ordenes/:id/etapas')
  @Permisos('produccion.editar')
  async crearEtapa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearOrdenEtapaDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const etapa = await this.produccionServicio.crearEtapa(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'orden_etapas', entidadId: etapa.id };
    return respuestaExitosa(etapa, 'Etapa agregada a la orden exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /produccion/etapas/:id/asignaciones — asignar operador a una etapa
  // ---------------------------------------------------------------------------

  @Post('etapas/:id/asignaciones')
  @Permisos('produccion.editar')
  async asignarEtapa(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AsignarOrdenEtapaDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const asignacion = await this.produccionServicio.asignarEtapa(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'orden_asignaciones', entidadId: asignacion.id };
    return respuestaExitosa(asignacion, 'Operador asignado a la etapa exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /produccion/eventos — registrar evento operativo
  // ---------------------------------------------------------------------------

  @Post('eventos')
  @Permisos('produccion.editar')
  async crearEvento(
    @Body() dto: CrearEventoOperativoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const evento = await this.produccionServicio.crearEvento(dto, req.user);
    req.auditoriaContexto = { entidad: 'eventos_operativos', entidadId: evento.id };
    return respuestaExitosa(evento, 'Evento operativo registrado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /produccion/ordenes/:id/eventos — listar eventos de una orden
  // ---------------------------------------------------------------------------

  @Get('ordenes/:id/eventos')
  @Permisos('produccion.ver')
  async listarEventos(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const eventos = await this.produccionServicio.listarEventos(id);
    req.auditoriaContexto = { entidad: 'ordenes_produccion', entidadId: id };
    return respuestaExitosa(eventos, 'Eventos de la orden obtenidos exitosamente');
  }
}
