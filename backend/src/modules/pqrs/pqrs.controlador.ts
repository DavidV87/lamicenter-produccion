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
import { PqrsServicio } from './pqrs.servicio';
import { CrearPqrsDto } from './dto/crear-pqrs.dto';
import { ListarPqrsQueryDto } from './dto/listar-pqrs-query.dto';
import { CambiarEstadoPqrsDto } from './dto/cambiar-estado-pqrs.dto';
import { CrearSeguimientoPqrsDto } from './dto/crear-seguimiento-pqrs.dto';
import { CrearEvidenciaPqrsDto } from './dto/crear-evidencia-pqrs.dto';
import { AsignarResponsablePqrsDto } from './dto/asignar-responsable-pqrs.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { ContextoAuditoria } from '../../common/interfaces/contexto-auditoria.interface';

interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
  auditoriaContexto?: ContextoAuditoria;
}

@Controller('pqrs')
export class PqrsControlador {
  constructor(private readonly pqrsServicio: PqrsServicio) {}

  // ---------------------------------------------------------------------------
  // POST /pqrs — crear PQRS
  // ---------------------------------------------------------------------------

  @Post()
  @Permisos('pqrs.crear')
  async crearPqrs(
    @Body() dto: CrearPqrsDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.pqrsServicio.crearPqrs(dto, req.user);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: resultado.pqrs.id };
    return respuestaExitosa(resultado, 'PQRS creada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pqrs — listar con filtros y paginación
  // ---------------------------------------------------------------------------

  @Get()
  @Permisos('pqrs.ver')
  async listarPqrs(
    @Query() query: ListarPqrsQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.pqrsServicio.listarPqrs(query);
    return respuestaExitosa(resultado, 'PQRS obtenidas exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pqrs/:id — detalle completo
  // ---------------------------------------------------------------------------

  @Get(':id')
  @Permisos('pqrs.ver')
  async obtenerPqrs(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const pqrs = await this.pqrsServicio.obtenerPqrs(id);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: id };
    return respuestaExitosa(pqrs, 'PQRS obtenida exitosamente');
  }

  // ---------------------------------------------------------------------------
  // PATCH /pqrs/:id/estado — cambiar estado via motor
  // ---------------------------------------------------------------------------

  @Patch(':id/estado')
  @Permisos('pqrs.cambiar_estado')
  async cambiarEstadoPqrs(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CambiarEstadoPqrsDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.pqrsServicio.cambiarEstadoPqrs(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: id };
    return respuestaExitosa(resultado, 'Estado de la PQRS actualizado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /pqrs/:id/seguimientos — registrar seguimiento inmutable
  // ---------------------------------------------------------------------------

  @Post(':id/seguimientos')
  @Permisos('pqrs.editar')
  async crearSeguimiento(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearSeguimientoPqrsDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const seguimiento = await this.pqrsServicio.crearSeguimiento(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: id };
    return respuestaExitosa(seguimiento, 'Seguimiento registrado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pqrs/:id/seguimientos — listar seguimientos
  // ---------------------------------------------------------------------------

  @Get(':id/seguimientos')
  @Permisos('pqrs.ver')
  async obtenerSeguimientos(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const seguimientos = await this.pqrsServicio.obtenerSeguimientos(id);
    return respuestaExitosa(seguimientos, 'Seguimientos obtenidos exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /pqrs/:id/evidencias — registrar evidencia inmutable
  // ---------------------------------------------------------------------------

  @Post(':id/evidencias')
  @Permisos('pqrs.editar')
  async crearEvidencia(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CrearEvidenciaPqrsDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const evidencia = await this.pqrsServicio.crearEvidencia(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: id };
    return respuestaExitosa(evidencia, 'Evidencia registrada exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pqrs/:id/evidencias — listar evidencias
  // ---------------------------------------------------------------------------

  @Get(':id/evidencias')
  @Permisos('pqrs.ver')
  async obtenerEvidencias(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const evidencias = await this.pqrsServicio.obtenerEvidencias(id);
    return respuestaExitosa(evidencias, 'Evidencias obtenidas exitosamente');
  }

  // ---------------------------------------------------------------------------
  // POST /pqrs/:id/responsables — asignar responsable (reasignación cierra activo)
  // ---------------------------------------------------------------------------

  @Post(':id/responsables')
  @Permisos('pqrs.editar')
  async asignarResponsable(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AsignarResponsablePqrsDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const responsable = await this.pqrsServicio.asignarResponsable(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'pqrs', entidadId: id };
    return respuestaExitosa(responsable, 'Responsable asignado exitosamente');
  }

  // ---------------------------------------------------------------------------
  // GET /pqrs/:id/responsables — listar responsables (activos e históricos)
  // ---------------------------------------------------------------------------

  @Get(':id/responsables')
  @Permisos('pqrs.ver')
  async obtenerResponsables(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const responsables = await this.pqrsServicio.obtenerResponsables(id);
    return respuestaExitosa(responsables, 'Responsables obtenidos exitosamente');
  }
}
