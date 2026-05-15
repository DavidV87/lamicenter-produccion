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
import { DespachoServicio } from './despacho.servicio';
import { CrearDespachoDto } from './dto/crear-despacho.dto';
import { ListarDespachosQueryDto } from './dto/listar-despachos-query.dto';
import { CambiarEstadoDespachoDto } from './dto/cambiar-estado-despacho.dto';
import { CrearChecklistDespachoDto } from './dto/crear-checklist-despacho.dto';
import { CrearEvidenciaDespachoDto } from './dto/crear-evidencia-despacho.dto';
import { ActualizarUbicacionPedidoDto } from './dto/actualizar-ubicacion-pedido.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Roles } from '../seguridad/auth/decorators/roles.decorador';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { ContextoAuditoria } from '../../common/interfaces/contexto-auditoria.interface';

interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
  auditoriaContexto?: ContextoAuditoria;
}

@Controller('despacho')
export class DespachoControlador {
  constructor(private readonly despachoServicio: DespachoServicio) {}

  // ===========================================================================
  // RUTAS DE UBICACIÓN (deben declararse ANTES que /:id para evitar colisión)
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // PATCH /despacho/pedidos/:pedidoId/ubicacion — upsert ubicación del pedido
  // ---------------------------------------------------------------------------

  @Patch('pedidos/:pedidoId/ubicacion')
  @Permisos('despacho.editar')
  async actualizarUbicacionPedido(
    @Param('pedidoId', ParseUUIDPipe) pedidoId: string,
    @Body() dto: ActualizarUbicacionPedidoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const ubicacion = await this.despachoServicio.actualizarUbicacionPedido(pedidoId, dto, req.user);
    req.auditoriaContexto = { entidad: 'ubicacion_pedido', entidadId: pedidoId };
    return respuestaExitosa(ubicacion, 'Ubicación del pedido actualizada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /despacho/pedidos/:pedidoId/ubicacion — ubicación actual + historial
  // ---------------------------------------------------------------------------

  @Get('pedidos/:pedidoId/ubicacion')
  @Permisos('despacho.ver')
  async obtenerUbicacionPedido(
    @Param('pedidoId', ParseUUIDPipe) pedidoId: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const ubicacion = await this.despachoServicio.obtenerUbicacionPedido(pedidoId);
    req.auditoriaContexto = { entidad: 'ubicacion_pedido', entidadId: pedidoId };
    return respuestaExitosa(ubicacion, 'Ubicación del pedido obtenida exitosamente');
  }

  // ===========================================================================
  // DESPACHOS — CRUD + ESTADO
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /despacho — crear despacho
  // ---------------------------------------------------------------------------

  @Post()
  @Roles('despacho', 'coordinador', 'gerente')
  @Permisos('despacho.crear')
  async crearDespacho(
    @Body() dto: CrearDespachoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const despacho = await this.despachoServicio.crearDespacho(dto, req.user);
    req.auditoriaContexto = { entidad: 'despachos', entidadId: despacho.id };
    return respuestaExitosa(despacho, 'Despacho creado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /despacho — listar con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get()
  @Permisos('despacho.ver')
  async listarDespachos(
    @Query() query: ListarDespachosQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.despachoServicio.listarDespachos(query);
    return respuestaExitosa(resultado, 'Despachos obtenidos exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /despacho/:id — detalle completo
  // ---------------------------------------------------------------------------

  @Get(':id')
  @Permisos('despacho.ver')
  async obtenerDespacho(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const despacho = await this.despachoServicio.obtenerDespacho(id);
    req.auditoriaContexto = { entidad: 'despachos', entidadId: id };
    return respuestaExitosa(despacho, 'Despacho obtenido exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /despacho/:id/estado — cambiar estado via motor de estados
  // ---------------------------------------------------------------------------

  @Patch(':id/estado')
  @Permisos('despacho.cambiar_estado')
  async cambiarEstadoDespacho(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoDespachoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.despachoServicio.cambiarEstadoDespacho(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'despachos', entidadId: id };
    return respuestaExitosa(resultado, 'Estado del despacho actualizado exitosamente');
  }

  // ===========================================================================
  // CHECKLIST
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /despacho/:id/checklist — crear checklist con ítems
  // ---------------------------------------------------------------------------

  @Post(':id/checklist')
  @Permisos('despacho.editar')
  async crearChecklist(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearChecklistDespachoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const checklist = await this.despachoServicio.crearChecklist(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'checklist_despacho', entidadId: checklist.id };
    return respuestaExitosa(checklist, 'Checklist de despacho creado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /despacho/:id/checklist — listar checklists de un despacho
  // ---------------------------------------------------------------------------

  @Get(':id/checklist')
  @Permisos('despacho.ver')
  async obtenerChecklists(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const checklists = await this.despachoServicio.obtenerChecklists(id);
    return respuestaExitosa(checklists, 'Checklists del despacho obtenidos exitosamente');
  }

  // ===========================================================================
  // EVIDENCIAS
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /despacho/:id/evidencias — registrar evidencia inmutable
  // ---------------------------------------------------------------------------

  @Post(':id/evidencias')
  @Permisos('despacho.editar')
  async crearEvidencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearEvidenciaDespachoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const evidencia = await this.despachoServicio.crearEvidencia(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'evidencias_despacho', entidadId: evidencia.id };
    return respuestaExitosa(evidencia, 'Evidencia registrada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /despacho/:id/evidencias — listar evidencias de un despacho
  // ---------------------------------------------------------------------------

  @Get(':id/evidencias')
  @Permisos('despacho.ver')
  async obtenerEvidencias(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const evidencias = await this.despachoServicio.obtenerEvidencias(id);
    return respuestaExitosa(evidencias, 'Evidencias del despacho obtenidas exitosamente');
  }
}
