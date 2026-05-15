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
import { AbastecimientoServicio } from './abastecimiento.servicio';
import { CrearRequerimientoMaterialDto } from './dto/crear-requerimiento-material.dto';
import { ListarRequerimientosQueryDto } from './dto/listar-requerimientos-query.dto';
import { CambiarEstadoRequerimientoDto } from './dto/cambiar-estado-requerimiento.dto';
import { CrearSolicitudCompraDto } from './dto/crear-solicitud-compra.dto';
import { ListarSolicitudesCompraQueryDto } from './dto/listar-solicitudes-compra-query.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { ContextoAuditoria } from '../../common/interfaces/contexto-auditoria.interface';

interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
  auditoriaContexto?: ContextoAuditoria;
}

@Controller('abastecimiento')
export class AbastecimientoControlador {
  constructor(private readonly abastecimientoServicio: AbastecimientoServicio) {}

  // ===========================================================================
  // REQUERIMIENTOS DE MATERIAL
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /abastecimiento/requerimientos — crear requerimiento de material
  // ---------------------------------------------------------------------------

  @Post('requerimientos')
  @Permisos('abastecimiento.crear')
  async crearRequerimiento(
    @Body() dto: CrearRequerimientoMaterialDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const requerimiento = await this.abastecimientoServicio.crearRequerimiento(dto, req.user);
    req.auditoriaContexto = { entidad: 'requerimientos_material', entidadId: requerimiento.id };
    return respuestaExitosa(requerimiento, 'Requerimiento de material creado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /abastecimiento/requerimientos — listar con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get('requerimientos')
  @Permisos('abastecimiento.ver')
  async listarRequerimientos(
    @Query() query: ListarRequerimientosQueryDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.abastecimientoServicio.listarRequerimientos(query, req.user);
    return respuestaExitosa(resultado, 'Requerimientos de material obtenidos exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /abastecimiento/requerimientos/:id — detalle completo
  // ---------------------------------------------------------------------------

  @Get('requerimientos/:id')
  @Permisos('abastecimiento.ver')
  async obtenerRequerimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const requerimiento = await this.abastecimientoServicio.obtenerRequerimiento(id);
    req.auditoriaContexto = { entidad: 'requerimientos_material', entidadId: id };
    return respuestaExitosa(requerimiento, 'Requerimiento de material obtenido exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /abastecimiento/requerimientos/:id/estado — cambiar estado
  // ---------------------------------------------------------------------------

  @Patch('requerimientos/:id/estado')
  @Permisos('abastecimiento.cambiar_estado')
  async cambiarEstadoRequerimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoRequerimientoDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.abastecimientoServicio.cambiarEstadoRequerimiento(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'requerimientos_material', entidadId: id };
    return respuestaExitosa(resultado, 'Estado del requerimiento actualizado exitosamente');
  }

  // ===========================================================================
  // SOLICITUDES DE COMPRA
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // POST /abastecimiento/solicitudes-compra — crear solicitud de compra
  // ---------------------------------------------------------------------------

  @Post('solicitudes-compra')
  @Permisos('abastecimiento.crear')
  async crearSolicitudCompra(
    @Body() dto: CrearSolicitudCompraDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const solicitud = await this.abastecimientoServicio.crearSolicitudCompra(dto, req.user);
    req.auditoriaContexto = { entidad: 'solicitudes_compra', entidadId: solicitud.id };
    return respuestaExitosa(solicitud, 'Solicitud de compra creada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /abastecimiento/solicitudes-compra — listar con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get('solicitudes-compra')
  @Permisos('abastecimiento.ver')
  async listarSolicitudesCompra(
    @Query() query: ListarSolicitudesCompraQueryDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.abastecimientoServicio.listarSolicitudesCompra(query, req.user);
    return respuestaExitosa(resultado, 'Solicitudes de compra obtenidas exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /abastecimiento/solicitudes-compra/:id — detalle completo
  // ---------------------------------------------------------------------------

  @Get('solicitudes-compra/:id')
  @Permisos('abastecimiento.ver')
  async obtenerSolicitudCompra(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const solicitud = await this.abastecimientoServicio.obtenerSolicitudCompra(id);
    req.auditoriaContexto = { entidad: 'solicitudes_compra', entidadId: id };
    return respuestaExitosa(solicitud, 'Solicitud de compra obtenida exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /abastecimiento/solicitudes-compra/:id/estado — cambiar estado
  // ---------------------------------------------------------------------------

  @Patch('solicitudes-compra/:id/estado')
  @Permisos('abastecimiento.cambiar_estado')
  async cambiarEstadoSolicitud(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoSolicitudDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.abastecimientoServicio.cambiarEstadoSolicitud(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'solicitudes_compra', entidadId: id };
    return respuestaExitosa(resultado, 'Estado de la solicitud actualizado exitosamente');
  }
}
