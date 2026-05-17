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
import { CatalogoServicio } from './catalogo.servicio';
import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ListarClientesQueryDto } from './dto/listar-clientes-query.dto';
import { CrearItemDto } from './dto/crear-item.dto';
import { ActualizarItemDto } from './dto/actualizar-item.dto';
import { ListarItemsQueryDto } from './dto/listar-items-query.dto';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';
import { ListarProveedoresQueryDto } from './dto/listar-proveedores-query.dto';
import { CrearMaquinaDto } from './dto/crear-maquina.dto';
import { ActualizarMaquinaDto } from './dto/actualizar-maquina.dto';
import { ListarMaquinasQueryDto } from './dto/listar-maquinas-query.dto';
import { CrearUbicacionDto } from './dto/crear-ubicacion.dto';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';
import { ListarUbicacionesQueryDto } from './dto/listar-ubicaciones-query.dto';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';
import { ContextoAuditoria } from '../../common/interfaces/contexto-auditoria.interface';

interface SolicitudConUsuario extends Request {
  user: UsuarioJwt;
  auditoriaContexto?: ContextoAuditoria;
}

@Controller('catalogo')
export class CatalogoControlador {
  constructor(private readonly catalogoServicio: CatalogoServicio) {}

  // ===========================================================================
  // CLIENTES
  // ===========================================================================

  @Post('clientes')
  @Permisos('catalogo.crear')
  async crearCliente(
    @Body() dto: CrearClienteDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const cliente = await this.catalogoServicio.crearCliente(dto, req.user);
    req.auditoriaContexto = { entidad: 'clientes', entidadId: cliente.id };
    return respuestaExitosa(cliente, 'Cliente creado exitosamente');
  }

  @Get('clientes')
  @Permisos('catalogo.ver')
  async listarClientes(
    @Query() query: ListarClientesQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.catalogoServicio.listarClientes(query);
    return respuestaExitosa(resultado, 'Clientes obtenidos exitosamente');
  }

  @Get('clientes/:id')
  @Permisos('catalogo.ver')
  async obtenerCliente(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const cliente = await this.catalogoServicio.obtenerCliente(id);
    req.auditoriaContexto = { entidad: 'clientes', entidadId: id };
    return respuestaExitosa(cliente, 'Cliente obtenido exitosamente');
  }

  @Patch('clientes/:id')
  @Permisos('catalogo.editar')
  async actualizarCliente(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarClienteDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const cliente = await this.catalogoServicio.actualizarCliente(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'clientes', entidadId: id };
    return respuestaExitosa(cliente, 'Cliente actualizado exitosamente');
  }

  // ===========================================================================
  // ITEMS
  // ===========================================================================

  @Post('items')
  @Permisos('catalogo.crear')
  async crearItem(
    @Body() dto: CrearItemDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const item = await this.catalogoServicio.crearItem(dto, req.user);
    req.auditoriaContexto = { entidad: 'items', entidadId: item.id };
    return respuestaExitosa(item, 'Ítem creado exitosamente');
  }

  @Get('items')
  @Permisos('catalogo.ver')
  async listarItems(
    @Query() query: ListarItemsQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.catalogoServicio.listarItems(query);
    return respuestaExitosa(resultado, 'Ítems obtenidos exitosamente');
  }

  @Get('items/:id')
  @Permisos('catalogo.ver')
  async obtenerItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const item = await this.catalogoServicio.obtenerItem(id);
    req.auditoriaContexto = { entidad: 'items', entidadId: id };
    return respuestaExitosa(item, 'Ítem obtenido exitosamente');
  }

  @Patch('items/:id')
  @Permisos('catalogo.editar')
  async actualizarItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarItemDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const item = await this.catalogoServicio.actualizarItem(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'items', entidadId: id };
    return respuestaExitosa(item, 'Ítem actualizado exitosamente');
  }

  // ===========================================================================
  // PROVEEDORES
  // ===========================================================================

  @Post('proveedores')
  @Permisos('catalogo.crear')
  async crearProveedor(
    @Body() dto: CrearProveedorDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const proveedor = await this.catalogoServicio.crearProveedor(dto, req.user);
    req.auditoriaContexto = { entidad: 'proveedores', entidadId: proveedor.id };
    return respuestaExitosa(proveedor, 'Proveedor creado exitosamente');
  }

  @Get('proveedores')
  @Permisos('catalogo.ver')
  async listarProveedores(
    @Query() query: ListarProveedoresQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.catalogoServicio.listarProveedores(query);
    return respuestaExitosa(resultado, 'Proveedores obtenidos exitosamente');
  }

  @Get('proveedores/:id')
  @Permisos('catalogo.ver')
  async obtenerProveedor(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const proveedor = await this.catalogoServicio.obtenerProveedor(id);
    req.auditoriaContexto = { entidad: 'proveedores', entidadId: id };
    return respuestaExitosa(proveedor, 'Proveedor obtenido exitosamente');
  }

  @Patch('proveedores/:id')
  @Permisos('catalogo.editar')
  async actualizarProveedor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarProveedorDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const proveedor = await this.catalogoServicio.actualizarProveedor(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'proveedores', entidadId: id };
    return respuestaExitosa(proveedor, 'Proveedor actualizado exitosamente');
  }

  // ===========================================================================
  // MAQUINAS
  // ===========================================================================

  @Post('maquinas')
  @Permisos('catalogo.crear')
  async crearMaquina(
    @Body() dto: CrearMaquinaDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const maquina = await this.catalogoServicio.crearMaquina(dto, req.user);
    req.auditoriaContexto = { entidad: 'maquinas', entidadId: maquina.id };
    return respuestaExitosa(maquina, 'Máquina creada exitosamente');
  }

  @Get('maquinas')
  @Permisos('catalogo.ver')
  async listarMaquinas(
    @Query() query: ListarMaquinasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.catalogoServicio.listarMaquinas(query);
    return respuestaExitosa(resultado, 'Máquinas obtenidas exitosamente');
  }

  @Get('maquinas/:id')
  @Permisos('catalogo.ver')
  async obtenerMaquina(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const maquina = await this.catalogoServicio.obtenerMaquina(id);
    req.auditoriaContexto = { entidad: 'maquinas', entidadId: id };
    return respuestaExitosa(maquina, 'Máquina obtenida exitosamente');
  }

  @Patch('maquinas/:id')
  @Permisos('catalogo.editar')
  async actualizarMaquina(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMaquinaDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const maquina = await this.catalogoServicio.actualizarMaquina(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'maquinas', entidadId: id };
    return respuestaExitosa(maquina, 'Máquina actualizada exitosamente');
  }

  // ===========================================================================
  // REFERENCIAS (solo lectura)
  // ===========================================================================

  @Get('tipos-item')
  @Permisos('catalogo.ver')
  async obtenerTiposItem(): Promise<RespuestaApi<unknown>> {
    const tipos = await this.catalogoServicio.obtenerTiposItem();
    return respuestaExitosa(tipos, 'Tipos de ítem obtenidos exitosamente');
  }

  @Get('sedes')
  @Permisos('catalogo.ver')
  async obtenerSedes(): Promise<RespuestaApi<unknown>> {
    const sedes = await this.catalogoServicio.obtenerSedes();
    return respuestaExitosa(sedes, 'Sedes obtenidas exitosamente');
  }

  @Get('etapas-produccion')
  @Permisos('catalogo.ver')
  async obtenerEtapasProduccion(): Promise<RespuestaApi<unknown>> {
    const etapas = await this.catalogoServicio.obtenerEtapasProduccion();
    return respuestaExitosa(etapas, 'Etapas de producción obtenidas exitosamente');
  }

  @Get('tipos-novedad')
  @Permisos('catalogo.ver')
  async obtenerTiposNovedad(): Promise<RespuestaApi<unknown>> {
    const tipos = await this.catalogoServicio.obtenerTiposNovedad();
    return respuestaExitosa(tipos, 'Tipos de novedad obtenidos exitosamente');
  }

  @Get('tipos-validacion-despacho')
  @Permisos('catalogo.ver')
  async obtenerTiposValidacionDespacho(): Promise<RespuestaApi<unknown>> {
    const tipos = await this.catalogoServicio.obtenerTiposValidacionDespacho();
    return respuestaExitosa(tipos, 'Tipos de validación de despacho obtenidos exitosamente');
  }

  @Get('tipos-validacion-despacho/:id')
  @Permisos('catalogo.ver')
  async obtenerTipoValidacionDespachoPorId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<RespuestaApi<unknown>> {
    const tipo = await this.catalogoServicio.obtenerTipoValidacionDespachoPorId(id);
    return respuestaExitosa(tipo, 'Tipo de validación de despacho obtenido exitosamente');
  }

  // ===========================================================================
  // UBICACIONES
  // ===========================================================================

  @Post('ubicaciones')
  @Permisos('catalogo.crear')
  async crearUbicacion(
    @Body() dto: CrearUbicacionDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const ubicacion = await this.catalogoServicio.crearUbicacion(dto, req.user);
    req.auditoriaContexto = { entidad: 'ubicaciones', entidadId: ubicacion.id };
    return respuestaExitosa(ubicacion, 'Ubicación creada exitosamente');
  }

  @Get('ubicaciones')
  @Permisos('catalogo.ver')
  async listarUbicaciones(
    @Query() query: ListarUbicacionesQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.catalogoServicio.listarUbicaciones(query);
    return respuestaExitosa(resultado, 'Ubicaciones obtenidas exitosamente');
  }

  @Get('ubicaciones/:id')
  @Permisos('catalogo.ver')
  async obtenerUbicacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const ubicacion = await this.catalogoServicio.obtenerUbicacion(id);
    req.auditoriaContexto = { entidad: 'ubicaciones', entidadId: id };
    return respuestaExitosa(ubicacion, 'Ubicación obtenida exitosamente');
  }

  @Patch('ubicaciones/:id')
  @Permisos('catalogo.editar')
  async actualizarUbicacion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUbicacionDto,
    @Req() req: SolicitudConUsuario,
  ): Promise<RespuestaApi<unknown>> {
    const ubicacion = await this.catalogoServicio.actualizarUbicacion(id, dto, req.user);
    req.auditoriaContexto = { entidad: 'ubicaciones', entidadId: id };
    return respuestaExitosa(ubicacion, 'Ubicación actualizada exitosamente');
  }
}
