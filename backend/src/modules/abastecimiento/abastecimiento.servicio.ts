import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria, TipoRequerimiento } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';
import { MotorEstadosServicio } from '../../common/motor-estados/motor-estados.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { ResultadoTransicion } from '../../common/motor-estados/interfaces/resultado-transicion.interface';

import { CrearRequerimientoMaterialDto } from './dto/crear-requerimiento-material.dto';
import { ListarRequerimientosQueryDto } from './dto/listar-requerimientos-query.dto';
import { CambiarEstadoRequerimientoDto } from './dto/cambiar-estado-requerimiento.dto';
import { CrearSolicitudCompraDto } from './dto/crear-solicitud-compra.dto';
import { ListarSolicitudesCompraQueryDto } from './dto/listar-solicitudes-compra-query.dto';
import { CambiarEstadoSolicitudDto } from './dto/cambiar-estado-solicitud.dto';

import {
  ListaPaginadaRequerimientos,
  RequerimientoMaterialDetalle,
  RequerimientoMaterialResumen,
} from './interfaces/requerimiento-material.interface';
import {
  ListaPaginadaSolicitudesCompra,
  SolicitudCompraDetalle,
  SolicitudCompraItemResumen,
  SolicitudCompraResumen,
} from './interfaces/solicitud-compra.interface';

@Injectable()
export class AbastecimientoServicio {
  private readonly logger = new Logger(AbastecimientoServicio.name);

  constructor(
    private readonly prisma: PrismaServicio,
    private readonly auditoria: AuditoriaServicio,
    private readonly motorEstados: MotorEstadosServicio,
  ) {}

  // ===========================================================================
  // REQUERIMIENTOS DE MATERIAL
  // ===========================================================================

  /**
   * Crea un requerimiento de material.
   *
   * Reglas:
   *   - item debe existir y estar activo.
   *   - sede debe existir y estar activa.
   *   - pedido / ordenProduccion / suborden opcionales — se validan si vienen.
   *   - tipoRequerimiento por defecto GENERAL si se omite.
   *   - Nace en estado inicial 'pendiente' del módulo 'requerimiento_material'.
   */
  async crearRequerimiento(
    dto: CrearRequerimientoMaterialDto,
    usuario: UsuarioJwt,
  ): Promise<RequerimientoMaterialDetalle> {
    // Validar item activo
    const item = await this.prisma.item.findUnique({
      where:  { id: dto.itemId },
      select: { id: true, activo: true },
    });
    if (!item || !item.activo) {
      throw new NotFoundException(`Ítem ${dto.itemId} no encontrado o inactivo`);
    }

    // Validar sede activa
    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) {
      throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);
    }

    // Validar referencias opcionales
    if (dto.pedidoId) {
      const existe = await this.prisma.pedido.findUnique({ where: { id: dto.pedidoId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }
    if (dto.ordenProduccionId) {
      const existe = await this.prisma.ordenProduccion.findUnique({ where: { id: dto.ordenProduccionId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Orden de producción ${dto.ordenProduccionId} no encontrada`);
    }
    if (dto.subordenId) {
      const existe = await this.prisma.suborden.findUnique({ where: { id: dto.subordenId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Suborden ${dto.subordenId} no encontrada`);
    }

    const estadoInicial = await this.prisma.estadoSistema.findUniqueOrThrow({
      where: { modulo_codigo: { modulo: 'requerimiento_material', codigo: 'pendiente' } },
    });

    const requerimiento = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevo = await tx.requerimientoMaterial.create({
        data: {
          itemId:               dto.itemId,
          sedeId:               dto.sedeId,
          pedidoId:             dto.pedidoId,
          ordenProduccionId:    dto.ordenProduccionId,
          subordenId:           dto.subordenId,
          tipoRequerimiento:    dto.tipoRequerimiento ?? TipoRequerimiento.GENERAL,
          estadoRequerimientoId: estadoInicial.id,
          cantidadRequerida:    dto.cantidadRequerida,
          fechaRequerida:       dto.fechaNecesaria ? new Date(dto.fechaNecesaria) : null,
          creadoPorUsuarioId:   usuario.sub,
          observaciones:        dto.observaciones,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'requerimientos_material',
          registroId:    nuevo.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            itemId:            dto.itemId,
            sedeId:            dto.sedeId,
            cantidadRequerida: dto.cantidadRequerida,
            estadoCodigo:      estadoInicial.codigo,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevo;
    });

    this.logger.log(
      `[Abastecimiento] Requerimiento creado: id=${requerimiento.id} item=${dto.itemId} por=${usuario.sub}`,
    );

    return this.obtenerRequerimiento(requerimiento.id);
  }

  // ---------------------------------------------------------------------------

  async listarRequerimientos(
    query: ListarRequerimientosQueryDto,
    _usuario: UsuarioJwt,
  ): Promise<ListaPaginadaRequerimientos> {
    const pagina = query.pagina ?? 1;
    const limite  = query.limite  ?? 20;
    const saltar  = (pagina - 1) * limite;

    const donde: Prisma.RequerimientoMaterialWhereInput = {};
    if (query.itemId)          donde.itemId             = query.itemId;
    if (query.sedeId)          donde.sedeId             = query.sedeId;
    if (query.pedidoId)        donde.pedidoId           = query.pedidoId;
    if (query.ordenProduccionId) donde.ordenProduccionId = query.ordenProduccionId;
    if (query.estadoId)        donde.estadoRequerimientoId = query.estadoId;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.requerimientoMaterial.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          item:                { select: { id: true, nombre: true } },
          sede:                { select: { id: true, nombre: true } },
          estadoRequerimiento: { select: { id: true, codigo: true, nombre: true } },
          creadoPor:           { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.requerimientoMaterial.count({ where: donde }),
    ]);

    const datos: RequerimientoMaterialResumen[] = registros.map((r) => ({
      id:                r.id,
      item:              { id: r.item.id, nombre: r.item.nombre },
      sede:              { id: r.sede.id, nombre: r.sede.nombre },
      estado:            { id: r.estadoRequerimiento.id, codigo: r.estadoRequerimiento.codigo, nombre: r.estadoRequerimiento.nombre },
      tipoRequerimiento: r.tipoRequerimiento,
      cantidadRequerida: r.cantidadRequerida.toNumber(),
      cantidadAtendida:  r.cantidadAtendida.toNumber(),
      fechaRequerida:    r.fechaRequerida,
      observaciones:     r.observaciones,
      creadoPor:         { id: r.creadoPor.id, nombre: r.creadoPor.nombre },
      creadoEn:          r.creadoEn,
      actualizadoEn:     r.actualizadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  // ---------------------------------------------------------------------------

  async obtenerRequerimiento(id: string): Promise<RequerimientoMaterialDetalle> {
    const r = await this.prisma.requerimientoMaterial.findUnique({
      where: { id },
      include: {
        item:                { select: { id: true, nombre: true } },
        sede:                { select: { id: true, nombre: true } },
        estadoRequerimiento: { select: { id: true, codigo: true, nombre: true } },
        creadoPor:           { select: { id: true, nombre: true } },
        atendidoPor:         { select: { id: true, nombre: true } },
        pedido:              { select: { id: true } },
        ordenProduccion:     { select: { id: true } },
        suborden:            { select: { id: true } },
      },
    });

    if (!r) {
      throw new NotFoundException(`Requerimiento de material ${id} no encontrado`);
    }

    return {
      id:                r.id,
      item:              { id: r.item.id, nombre: r.item.nombre },
      sede:              { id: r.sede.id, nombre: r.sede.nombre },
      estado:            { id: r.estadoRequerimiento.id, codigo: r.estadoRequerimiento.codigo, nombre: r.estadoRequerimiento.nombre },
      tipoRequerimiento: r.tipoRequerimiento,
      cantidadRequerida: r.cantidadRequerida.toNumber(),
      cantidadAtendida:  r.cantidadAtendida.toNumber(),
      cantidadAprobada:  r.cantidadAprobada ? r.cantidadAprobada.toNumber() : null,
      fechaRequerida:    r.fechaRequerida,
      observaciones:     r.observaciones,
      creadoPor:         { id: r.creadoPor.id, nombre: r.creadoPor.nombre },
      atendidoPor:       r.atendidoPor ? { id: r.atendidoPor.id, nombre: r.atendidoPor.nombre } : null,
      pedido:            r.pedido         ? { id: r.pedido.id }         : null,
      ordenProduccion:   r.ordenProduccion ? { id: r.ordenProduccion.id } : null,
      suborden:          r.suborden       ? { id: r.suborden.id }       : null,
      metadata:          r.metadata as Record<string, unknown> | null,
      creadoEn:          r.creadoEn,
      actualizadoEn:     r.actualizadoEn,
    };
  }

  // ---------------------------------------------------------------------------

  /**
   * Cambia el estado de un requerimiento via motor de estados.
   * El motor valida arcos, roles autorizados y escribe historial + auditoría en transacción.
   */
  async cambiarEstadoRequerimiento(
    id: string,
    dto: CambiarEstadoRequerimientoDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoTransicion> {
    await this.verificarRequerimientoExiste(id);

    return this.motorEstados.transicionar({
      modulo:            'requerimiento_material',
      entidad:           'requerimiento_material',
      entidadId:         id,
      estadoNuevoCodigo: dto.estadoNuevoCodigo,
      usuarioId:         usuario.sub,
      rolId:             usuario.rolId,
      observaciones:     dto.observaciones,
      metadata:          dto.metadata,
      forzar:            dto.forzar,
    });
  }

  // ===========================================================================
  // SOLICITUDES DE COMPRA
  // ===========================================================================

  /**
   * Crea una solicitud de compra con sus líneas de ítems.
   *
   * Reglas:
   *   - sede debe existir y estar activa.
   *   - proveedor, si viene, debe existir y estar activo.
   *   - Cada ítem: debe existir y estar activo; cantidadSolicitada > 0.
   *   - requerimientoMaterialId en cada ítem es opcional — se valida si viene.
   *   - Nace en estado inicial 'borrador' del módulo 'solicitud_compra'.
   *   - El código se genera como SC-YYYYMMDD-<timestamp_parcial>.
   *   - Cabecera + ítems + auditoría se persisten en una sola transacción.
   */
  async crearSolicitudCompra(
    dto: CrearSolicitudCompraDto,
    usuario: UsuarioJwt,
  ): Promise<SolicitudCompraDetalle> {
    // Validar sede activa
    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) {
      throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);
    }

    // Validar proveedor activo si se especifica
    if (dto.proveedorId) {
      const proveedor = await this.prisma.proveedor.findUnique({
        where:  { id: dto.proveedorId },
        select: { id: true, activo: true },
      });
      if (!proveedor || !proveedor.activo) {
        throw new NotFoundException(`Proveedor ${dto.proveedorId} no encontrado o inactivo`);
      }
    }

    // Validar cada ítem
    for (const linea of dto.items) {
      const itemExiste = await this.prisma.item.findUnique({
        where:  { id: linea.itemId },
        select: { id: true, activo: true },
      });
      if (!itemExiste || !itemExiste.activo) {
        throw new NotFoundException(`Ítem ${linea.itemId} no encontrado o inactivo`);
      }
      if (linea.requerimientoMaterialId) {
        const reqExiste = await this.prisma.requerimientoMaterial.findUnique({
          where:  { id: linea.requerimientoMaterialId },
          select: { id: true },
        });
        if (!reqExiste) {
          throw new NotFoundException(
            `Requerimiento de material ${linea.requerimientoMaterialId} no encontrado`,
          );
        }
      }
    }

    const estadoInicial = await this.prisma.estadoSistema.findUniqueOrThrow({
      where: { modulo_codigo: { modulo: 'solicitud_compra', codigo: 'borrador' } },
    });

    // Código único: SC-YYYYMMDD-<últimos 6 dígitos del timestamp>
    const hoy = new Date();
    const fechaStr = hoy.toISOString().slice(0, 10).replace(/-/g, '');
    const sufijo = Date.now().toString().slice(-6);
    const codigo = `SC-${fechaStr}-${sufijo}`;

    const solicitud = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nueva = await tx.solicitudCompra.create({
        data: {
          codigo,
          sedeId:            dto.sedeId,
          proveedorId:       dto.proveedorId,
          estadoSolicitudId: estadoInicial.id,
          creadoPorUsuarioId: usuario.sub,
          fechaSolicitud:    hoy,
          observaciones:     dto.observaciones,
        },
      });

      if (dto.items.length > 0) {
        await tx.solicitudCompraItem.createMany({
          data: dto.items.map((linea) => ({
            solicitudCompraId:       nueva.id,
            itemId:                  linea.itemId,
            requerimientoMaterialId: linea.requerimientoMaterialId,
            cantidadSolicitada:      linea.cantidadSolicitada,
            observaciones:           linea.observaciones,
          })),
        });
      }

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'solicitudes_compra',
          registroId:    nueva.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            codigo,
            sedeId:      dto.sedeId,
            proveedorId: dto.proveedorId ?? null,
            totalItems:  dto.items.length,
            estadoCodigo: estadoInicial.codigo,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nueva;
    });

    this.logger.log(
      `[Abastecimiento] SolicitudCompra creada: id=${solicitud.id} codigo=${codigo} por=${usuario.sub}`,
    );

    return this.obtenerSolicitudCompra(solicitud.id);
  }

  // ---------------------------------------------------------------------------

  async listarSolicitudesCompra(
    query: ListarSolicitudesCompraQueryDto,
    _usuario: UsuarioJwt,
  ): Promise<ListaPaginadaSolicitudesCompra> {
    const pagina = query.pagina ?? 1;
    const limite  = query.limite  ?? 20;
    const saltar  = (pagina - 1) * limite;

    const donde: Prisma.SolicitudCompraWhereInput = {};
    if (query.sedeId)      donde.sedeId           = query.sedeId;
    if (query.proveedorId) donde.proveedorId       = query.proveedorId;
    if (query.estadoId)    donde.estadoSolicitudId = query.estadoId;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.solicitudCompra.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          sede:            { select: { id: true, nombre: true } },
          proveedor:       { select: { id: true, razonSocial: true } },
          estadoSolicitud: { select: { id: true, codigo: true, nombre: true } },
          creadoPor:       { select: { id: true, nombre: true } },
          _count:          { select: { items: true } },
        },
      }),
      this.prisma.solicitudCompra.count({ where: donde }),
    ]);

    const datos: SolicitudCompraResumen[] = registros.map((s) => ({
      id:             s.id,
      codigo:         s.codigo,
      sede:           { id: s.sede.id, nombre: s.sede.nombre },
      proveedor:      s.proveedor ? { id: s.proveedor.id, nombre: s.proveedor.razonSocial } : null,
      estado:         { id: s.estadoSolicitud.id, codigo: s.estadoSolicitud.codigo, nombre: s.estadoSolicitud.nombre },
      creadoPor:      { id: s.creadoPor.id, nombre: s.creadoPor.nombre },
      fechaSolicitud: s.fechaSolicitud,
      observaciones:  s.observaciones,
      totalItems:     s._count.items,
      creadoEn:       s.creadoEn,
      actualizadoEn:  s.actualizadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  // ---------------------------------------------------------------------------

  async obtenerSolicitudCompra(id: string): Promise<SolicitudCompraDetalle> {
    const s = await this.prisma.solicitudCompra.findUnique({
      where: { id },
      include: {
        sede:            { select: { id: true, nombre: true } },
        proveedor:       { select: { id: true, razonSocial: true } },
        estadoSolicitud: { select: { id: true, codigo: true, nombre: true } },
        creadoPor:       { select: { id: true, nombre: true } },
        autorizadoPor:   { select: { id: true, nombre: true } },
        items: {
          orderBy: { creadoEn: 'asc' },
          include: {
            item: { select: { id: true, nombre: true, codigo: true } },
          },
        },
      },
    });

    if (!s) {
      throw new NotFoundException(`Solicitud de compra ${id} no encontrada`);
    }

    const items: SolicitudCompraItemResumen[] = s.items.map((linea) => ({
      id:                      linea.id,
      item:                    { id: linea.item.id, nombre: linea.item.nombre, codigo: linea.item.codigo },
      requerimientoMaterialId: linea.requerimientoMaterialId,
      cantidadSolicitada:      linea.cantidadSolicitada.toNumber(),
      observaciones:           linea.observaciones,
      creadoEn:                linea.creadoEn,
    }));

    return {
      id:             s.id,
      codigo:         s.codigo,
      sede:           { id: s.sede.id, nombre: s.sede.nombre },
      proveedor:      s.proveedor ? { id: s.proveedor.id, nombre: s.proveedor.razonSocial } : null,
      estado:         { id: s.estadoSolicitud.id, codigo: s.estadoSolicitud.codigo, nombre: s.estadoSolicitud.nombre },
      creadoPor:      { id: s.creadoPor.id, nombre: s.creadoPor.nombre },
      autorizadoPor:  s.autorizadoPor ? { id: s.autorizadoPor.id, nombre: s.autorizadoPor.nombre } : null,
      fechaSolicitud: s.fechaSolicitud,
      fechaRequerida: s.fechaRequerida,
      observaciones:  s.observaciones,
      metadata:       s.metadata as Record<string, unknown> | null,
      items,
      creadoEn:       s.creadoEn,
      actualizadoEn:  s.actualizadoEn,
    };
  }

  // ---------------------------------------------------------------------------

  /**
   * Cambia el estado de una solicitud de compra via motor de estados.
   * El motor valida arcos, roles autorizados y escribe auditoría en transacción.
   */
  async cambiarEstadoSolicitud(
    id: string,
    dto: CambiarEstadoSolicitudDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoTransicion> {
    await this.verificarSolicitudExiste(id);

    return this.motorEstados.transicionar({
      modulo:            'solicitud_compra',
      entidad:           'solicitud_compra',
      entidadId:         id,
      estadoNuevoCodigo: dto.estadoNuevoCodigo,
      usuarioId:         usuario.sub,
      rolId:             usuario.rolId,
      observaciones:     dto.observaciones,
      metadata:          dto.metadata,
      forzar:            dto.forzar,
    });
  }

  // ===========================================================================
  // Utilidades privadas
  // ===========================================================================

  private async verificarRequerimientoExiste(id: string): Promise<void> {
    const existe = await this.prisma.requerimientoMaterial.findUnique({
      where:  { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException(`Requerimiento de material ${id} no encontrado`);
    }
  }

  private async verificarSolicitudExiste(id: string): Promise<void> {
    const existe = await this.prisma.solicitudCompra.findUnique({
      where:  { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException(`Solicitud de compra ${id} no encontrada`);
    }
  }
}
