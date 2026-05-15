import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria, TipoEvidenciaDespacho } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { MotorEstadosServicio } from '../../common/motor-estados/motor-estados.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { ResultadoTransicion } from '../../common/motor-estados/interfaces/resultado-transicion.interface';

import { CrearDespachoDto } from './dto/crear-despacho.dto';
import { ListarDespachosQueryDto } from './dto/listar-despachos-query.dto';
import { CambiarEstadoDespachoDto } from './dto/cambiar-estado-despacho.dto';
import { CrearChecklistDespachoDto } from './dto/crear-checklist-despacho.dto';
import { CrearEvidenciaDespachoDto } from './dto/crear-evidencia-despacho.dto';
import { ActualizarUbicacionPedidoDto } from './dto/actualizar-ubicacion-pedido.dto';

import {
  ChecklistDespachoDetalle,
  DespachoDetalle,
  DespachoResumen,
  EvidenciaDespachoResumen,
  HistorialUbicacionResumen,
  ListaPaginadaDespachos,
  UbicacionPedidoDetalle,
} from './interfaces/despacho.interfaces';

@Injectable()
export class DespachoServicio {
  private readonly logger = new Logger(DespachoServicio.name);

  constructor(
    private readonly prisma: PrismaServicio,
    private readonly motorEstados: MotorEstadosServicio,
  ) {}

  // ===========================================================================
  // DESPACHOS — CRUD + ESTADO
  // ===========================================================================

  /**
   * Crea un despacho.
   *
   * Reglas:
   *   - pedidoId debe existir.
   *   - sedeSalidaId debe existir y estar activa.
   *   - encargadoDespachoId debe existir y estar activo si se proporciona; si se
   *     omite, se usa el usuario en sesión como encargado.
   *   - fechaProgramada se persiste en fechaDespacho; si se omite, se usa now().
   *   - Nace en estado inicial 'pendiente' del módulo 'despacho'.
   */
  async crearDespacho(dto: CrearDespachoDto, usuario: UsuarioJwt): Promise<DespachoDetalle> {
    const pedido = await this.prisma.pedido.findUnique({
      where:  { id: dto.pedidoId },
      select: { id: true },
    });
    if (!pedido) throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);

    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeSalidaId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) {
      throw new NotFoundException(`Sede ${dto.sedeSalidaId} no encontrada o inactiva`);
    }

    if (dto.encargadoDespachoId) {
      const encargado = await this.prisma.usuario.findUnique({
        where:  { id: dto.encargadoDespachoId },
        select: { id: true, activo: true },
      });
      if (!encargado || !encargado.activo) {
        throw new NotFoundException(`Usuario encargado ${dto.encargadoDespachoId} no encontrado o inactivo`);
      }
    }

    const estadoInicial = await this.prisma.estadoSistema.findUniqueOrThrow({
      where: { modulo_codigo: { modulo: 'despacho', codigo: 'pendiente' } },
    });

    const despacho = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevo = await tx.despacho.create({
        data: {
          pedidoId:              dto.pedidoId,
          sedeId:                dto.sedeSalidaId,
          estadoDespachoId:      estadoInicial.id,
          creadoPorUsuarioId:    usuario.sub,
          despachoPorUsuarioId:  dto.encargadoDespachoId ?? usuario.sub,
          fechaDespacho:         dto.fechaProgramada ? new Date(dto.fechaProgramada) : new Date(),
          observaciones:         dto.observaciones,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'despachos',
          registroId:    nuevo.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   {
            pedidoId:    dto.pedidoId,
            sedeId:      dto.sedeSalidaId,
            estadoCodigo: estadoInicial.codigo,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevo;
    });

    this.logger.log(`[Despacho] Despacho creado: id=${despacho.id} pedido=${dto.pedidoId} por=${usuario.sub}`);
    return this.obtenerDespacho(despacho.id);
  }

  // ---------------------------------------------------------------------------

  async listarDespachos(query: ListarDespachosQueryDto): Promise<ListaPaginadaDespachos> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.DespachoWhereInput = {};
    if (query.pedidoId)           donde.pedidoId            = query.pedidoId;
    if (query.estadoDespachoId)   donde.estadoDespachoId    = query.estadoDespachoId;
    if (query.encargadoDespachoId) donde.despachoPorUsuarioId = query.encargadoDespachoId;
    if (query.sedeSalidaId)       donde.sedeId              = query.sedeSalidaId;

    if (query.fechaDesde || query.fechaHasta) {
      donde.fechaDespacho = {};
      if (query.fechaDesde) donde.fechaDespacho.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) donde.fechaDespacho.lte = new Date(query.fechaHasta);
    }

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.despacho.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          pedido: {
            select: {
              id:      true,
              cliente: { select: { id: true, razonSocial: true } },
            },
          },
          sede:           { select: { id: true, nombre: true } },
          estadoDespacho: { select: { id: true, codigo: true, nombre: true } },
          despachoPor:    { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.despacho.count({ where: donde }),
    ]);

    const datos: DespachoResumen[] = registros.map((d) => ({
      id:           d.id,
      pedido:       { id: d.pedido.id, cliente: { id: d.pedido.cliente.id, razonSocial: d.pedido.cliente.razonSocial } },
      sede:         d.sede,
      estado:       d.estadoDespacho,
      encargado:    { id: d.despachoPor.id, nombre: d.despachoPor.nombre },
      fechaDespacho: d.fechaDespacho,
      observaciones: d.observaciones,
      creadoEn:     d.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  // ---------------------------------------------------------------------------

  async obtenerDespacho(id: string): Promise<DespachoDetalle> {
    const d = await this.prisma.despacho.findUnique({
      where:   { id },
      include: {
        pedido: {
          select: {
            id:      true,
            cliente: { select: { id: true, razonSocial: true } },
          },
        },
        sede:           { select: { id: true, nombre: true } },
        estadoDespacho: { select: { id: true, codigo: true, nombre: true } },
        despachoPor:    { select: { id: true, nombre: true } },
        creadoPor:      { select: { id: true, nombre: true } },
        autorizadoPor:  { select: { id: true, nombre: true } },
        checklists: {
          orderBy: { creadoEn: 'asc' },
          include: {
            completadoPor: { select: { id: true, nombre: true } },
            items: {
              orderBy: { creadoEn: 'asc' },
              include: {
                tipoValidacionDespacho: { select: { id: true, codigo: true, nombre: true } },
              },
            },
          },
        },
        evidencias: {
          orderBy: { creadoEn: 'desc' },
          include: { creadoPor: { select: { id: true, nombre: true } } },
        },
      },
    });
    if (!d) throw new NotFoundException(`Despacho ${id} no encontrado`);

    const ubicacionActual = await this.prisma.ubicacionPedido.findUnique({
      where:   { pedidoId: d.pedidoId },
      include: {
        sede:          { select: { id: true, nombre: true } },
        ubicacion:     { select: { id: true, nombre: true, codigo: true } },
        actualizadoPor: { select: { id: true, nombre: true } },
      },
    });

    return {
      id:            d.id,
      pedido:        { id: d.pedido.id, cliente: { id: d.pedido.cliente.id, razonSocial: d.pedido.cliente.razonSocial } },
      sede:          d.sede,
      estado:        d.estadoDespacho,
      encargado:     { id: d.despachoPor.id, nombre: d.despachoPor.nombre },
      creadoPor:     { id: d.creadoPor.id, nombre: d.creadoPor.nombre },
      autorizadoPor: d.autorizadoPor ? { id: d.autorizadoPor.id, nombre: d.autorizadoPor.nombre } : null,
      fechaDespacho: d.fechaDespacho,
      observaciones: d.observaciones,
      creadoEn:      d.creadoEn,
      actualizadoEn: d.actualizadoEn,
      checklists: d.checklists.map((cl) => ({
        id:             cl.id,
        completado:     cl.completado,
        completadoPor:  cl.completadoPor ? { id: cl.completadoPor.id, nombre: cl.completadoPor.nombre } : null,
        fechaCompletado: cl.fechaCompletado,
        observaciones:  cl.observaciones,
        creadoEn:       cl.creadoEn,
        items: cl.items.map((it) => ({
          id:             it.id,
          tipoValidacion: { id: it.tipoValidacionDespacho.id, codigo: it.tipoValidacionDespacho.codigo, nombre: it.tipoValidacionDespacho.nombre },
          aprobado:       it.aprobado,
          observaciones:  it.observaciones,
          creadoEn:       it.creadoEn,
        })),
      })),
      evidencias: d.evidencias.map((e) => ({
        id:            e.id,
        tipoEvidencia: e.tipoEvidencia,
        rutaArchivo:   e.rutaArchivo,
        nombreOriginal: e.nombreOriginal,
        descripcion:   e.descripcion,
        creadoPor:     { id: e.creadoPor.id, nombre: e.creadoPor.nombre },
        creadoEn:      e.creadoEn,
      })),
      ubicacionActual: ubicacionActual
        ? {
            id:                  ubicacionActual.id,
            pedidoId:            d.pedidoId,
            sede:                ubicacionActual.sede,
            ubicacion:           ubicacionActual.ubicacion,
            descripcion:         ubicacionActual.descripcion,
            actualizadoPor:      { id: ubicacionActual.actualizadoPor.id, nombre: ubicacionActual.actualizadoPor.nombre },
            ultimaActualizacion: ubicacionActual.ultimaActualizacion,
          }
        : null,
    };
  }

  // ---------------------------------------------------------------------------

  async cambiarEstadoDespacho(
    id: string,
    dto: CambiarEstadoDespachoDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoTransicion> {
    return this.motorEstados.transicionar({
      modulo:           'despacho',
      entidad:          'despacho',
      entidadId:        id,
      estadoNuevoCodigo: dto.estadoNuevoCodigo,
      usuarioId:        usuario.sub,
      rolId:            usuario.rolId,
      observaciones:    dto.observaciones,
      metadata:         dto.metadata,
      forzar:           dto.forzar,
    });
  }

  // ===========================================================================
  // CHECKLIST
  // ===========================================================================

  /**
   * Crea un checklist con sus ítems para un despacho.
   *
   * Reglas:
   *   - No se admite checklist vacío (mínimo 1 ítem — validado en DTO).
   *   - Cada tipoValidacionDespachoId debe existir y estar activo.
   *   - completado = true cuando TODOS los ítems tienen cumple = true.
   *   - Si completado=true, se registra completadoPorUsuarioId y fechaCompletado.
   */
  async crearChecklist(
    despachoId: string,
    dto: CrearChecklistDespachoDto,
    usuario: UsuarioJwt,
  ): Promise<ChecklistDespachoDetalle> {
    const despacho = await this.prisma.despacho.findUnique({
      where:  { id: despachoId },
      select: { id: true },
    });
    if (!despacho) throw new NotFoundException(`Despacho ${despachoId} no encontrado`);

    for (const item of dto.items) {
      const tipo = await this.prisma.tipoValidacionDespacho.findUnique({
        where:  { id: item.tipoValidacionDespachoId },
        select: { id: true, activo: true },
      });
      if (!tipo || !tipo.activo) {
        throw new NotFoundException(
          `Tipo de validación de despacho ${item.tipoValidacionDespachoId} no encontrado o inactivo`,
        );
      }
    }

    const completado = dto.items.every((i) => i.cumple);
    const ahora = new Date();

    const checklist = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevoCl = await tx.checklistDespacho.create({
        data: {
          despachoId,
          observaciones:          dto.observaciones,
          completado,
          completadoPorUsuarioId: completado ? usuario.sub : undefined,
          fechaCompletado:        completado ? ahora : undefined,
        },
      });

      await tx.checklistDespachoItem.createMany({
        data: dto.items.map((it) => ({
          checklistDespachoId:     nuevoCl.id,
          tipoValidacionDespachoId: it.tipoValidacionDespachoId,
          aprobado:                it.cumple,
          observaciones:           it.observaciones,
        })),
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'checklist_despacho',
          registroId:    nuevoCl.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   {
            despachoId,
            totalItems: dto.items.length,
            completado,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevoCl;
    });

    this.logger.log(`[Despacho] Checklist creado: id=${checklist.id} despacho=${despachoId} completado=${completado} por=${usuario.sub}`);
    return this._obtenerChecklistById(checklist.id);
  }

  // ---------------------------------------------------------------------------

  async obtenerChecklists(despachoId: string): Promise<ChecklistDespachoDetalle[]> {
    const despacho = await this.prisma.despacho.findUnique({
      where:  { id: despachoId },
      select: { id: true },
    });
    if (!despacho) throw new NotFoundException(`Despacho ${despachoId} no encontrado`);

    const registros = await this.prisma.checklistDespacho.findMany({
      where:   { despachoId },
      orderBy: { creadoEn: 'asc' },
      include: {
        completadoPor: { select: { id: true, nombre: true } },
        items: {
          orderBy: { creadoEn: 'asc' },
          include: {
            tipoValidacionDespacho: { select: { id: true, codigo: true, nombre: true } },
          },
        },
      },
    });

    return registros.map((cl) => this._mapearChecklist(cl));
  }

  // ===========================================================================
  // EVIDENCIAS
  // ===========================================================================

  /**
   * Registra una evidencia inmutable para un despacho.
   *
   * Reglas:
   *   - Evidencias son inmutables — no existe endpoint de actualización.
   *   - rutaArchivo es REQUERIDO para tipos distintos de OBSERVACION.
   *   - Para OBSERVACION: rutaArchivo y nombreArchivo son opcionales.
   */
  async crearEvidencia(
    despachoId: string,
    dto: CrearEvidenciaDespachoDto,
    usuario: UsuarioJwt,
  ): Promise<EvidenciaDespachoResumen> {
    const despacho = await this.prisma.despacho.findUnique({
      where:  { id: despachoId },
      select: { id: true },
    });
    if (!despacho) throw new NotFoundException(`Despacho ${despachoId} no encontrado`);

    if (dto.tipoEvidencia !== TipoEvidenciaDespacho.OBSERVACION && !dto.rutaArchivo) {
      throw new BadRequestException(
        `rutaArchivo es requerido para evidencia tipo '${dto.tipoEvidencia}'`,
      );
    }

    const evidencia = await this.prisma.evidenciaDespacho.create({
      data: {
        despachoId,
        tipoEvidencia:      dto.tipoEvidencia,
        rutaArchivo:        dto.rutaArchivo,
        nombreOriginal:     dto.nombreArchivo,
        descripcion:        dto.observaciones,
        creadoPorUsuarioId: usuario.sub,
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    this.logger.log(`[Despacho] Evidencia registrada: id=${evidencia.id} tipo=${dto.tipoEvidencia} despacho=${despachoId} por=${usuario.sub}`);

    return {
      id:            evidencia.id,
      tipoEvidencia: evidencia.tipoEvidencia,
      rutaArchivo:   evidencia.rutaArchivo,
      nombreOriginal: evidencia.nombreOriginal,
      descripcion:   evidencia.descripcion,
      creadoPor:     { id: evidencia.creadoPor.id, nombre: evidencia.creadoPor.nombre },
      creadoEn:      evidencia.creadoEn,
    };
  }

  // ---------------------------------------------------------------------------

  async obtenerEvidencias(despachoId: string): Promise<EvidenciaDespachoResumen[]> {
    const despacho = await this.prisma.despacho.findUnique({
      where:  { id: despachoId },
      select: { id: true },
    });
    if (!despacho) throw new NotFoundException(`Despacho ${despachoId} no encontrado`);

    const registros = await this.prisma.evidenciaDespacho.findMany({
      where:   { despachoId },
      orderBy: { creadoEn: 'desc' },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    return registros.map((e) => ({
      id:            e.id,
      tipoEvidencia: e.tipoEvidencia,
      rutaArchivo:   e.rutaArchivo,
      nombreOriginal: e.nombreOriginal,
      descripcion:   e.descripcion,
      creadoPor:     { id: e.creadoPor.id, nombre: e.creadoPor.nombre },
      creadoEn:      e.creadoEn,
    }));
  }

  // ===========================================================================
  // UBICACION PEDIDO
  // ===========================================================================

  /**
   * Actualiza la ubicación física de un pedido (upsert).
   *
   * Reglas críticas:
   *   - UbicacionPedido es única por pedido (@unique pedidoId): se usa upsert.
   *   - Cada modificación genera un HistorialUbicacionPedido inmutable en la misma
   *     transacción — garantía de trazabilidad completa.
   *   - Si se proporciona ubicacionId, debe pertenecer a la sedeId indicada.
   */
  async actualizarUbicacionPedido(
    pedidoId: string,
    dto: ActualizarUbicacionPedidoDto,
    usuario: UsuarioJwt,
  ): Promise<UbicacionPedidoDetalle> {
    const pedido = await this.prisma.pedido.findUnique({
      where:  { id: pedidoId },
      select: { id: true },
    });
    if (!pedido) throw new NotFoundException(`Pedido ${pedidoId} no encontrado`);

    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);

    if (dto.ubicacionId) {
      const ubicacion = await this.prisma.ubicacion.findUnique({
        where:  { id: dto.ubicacionId },
        select: { id: true, sedeId: true, activo: true },
      });
      if (!ubicacion || !ubicacion.activo) {
        throw new NotFoundException(`Ubicación ${dto.ubicacionId} no encontrada o inactiva`);
      }
      if (ubicacion.sedeId !== dto.sedeId) {
        throw new BadRequestException(
          `La ubicación ${dto.ubicacionId} no pertenece a la sede ${dto.sedeId}`,
        );
      }
    }

    const ahora = new Date();

    await this.prisma.ejecutarTransaccion(async (tx) => {
      await tx.ubicacionPedido.upsert({
        where:  { pedidoId },
        create: {
          pedidoId,
          sedeId:                  dto.sedeId,
          ubicacionId:             dto.ubicacionId,
          descripcion:             dto.observaciones,
          actualizadoPorUsuarioId: usuario.sub,
          ultimaActualizacion:     ahora,
        },
        update: {
          sedeId:                  dto.sedeId,
          ubicacionId:             dto.ubicacionId,
          descripcion:             dto.observaciones,
          actualizadoPorUsuarioId: usuario.sub,
          ultimaActualizacion:     ahora,
        },
      });

      // Historial inmutable: se inserta siempre, incluso si los datos no cambian.
      await tx.historialUbicacionPedido.create({
        data: {
          pedidoId,
          sedeId:                  dto.sedeId,
          ubicacionId:             dto.ubicacionId,
          descripcion:             dto.observaciones,
          registradoPorUsuarioId:  usuario.sub,
        },
      });
    });

    this.logger.log(`[Despacho] Ubicación pedido actualizada: pedido=${pedidoId} sede=${dto.sedeId} por=${usuario.sub}`);
    return this.obtenerUbicacionPedido(pedidoId);
  }

  // ---------------------------------------------------------------------------

  async obtenerUbicacionPedido(pedidoId: string): Promise<UbicacionPedidoDetalle> {
    const pedido = await this.prisma.pedido.findUnique({
      where:  { id: pedidoId },
      select: { id: true },
    });
    if (!pedido) throw new NotFoundException(`Pedido ${pedidoId} no encontrado`);

    const ubicacion = await this.prisma.ubicacionPedido.findUnique({
      where:   { pedidoId },
      include: {
        sede:           { select: { id: true, nombre: true } },
        ubicacion:      { select: { id: true, nombre: true, codigo: true } },
        actualizadoPor: { select: { id: true, nombre: true } },
      },
    });
    if (!ubicacion) throw new NotFoundException(`No hay ubicación registrada para el pedido ${pedidoId}`);

    const historial = await this.prisma.historialUbicacionPedido.findMany({
      where:   { pedidoId },
      orderBy: { creadoEn: 'desc' },
      take:    50,
      include: {
        sede:          { select: { id: true, nombre: true } },
        ubicacion:     { select: { id: true, nombre: true, codigo: true } },
        registradoPor: { select: { id: true, nombre: true } },
      },
    });

    const historialMapeado: HistorialUbicacionResumen[] = historial.map((h) => ({
      id:           h.id,
      sede:         h.sede,
      ubicacion:    h.ubicacion,
      descripcion:  h.descripcion,
      registradoPor: { id: h.registradoPor.id, nombre: h.registradoPor.nombre },
      creadoEn:     h.creadoEn,
    }));

    return {
      id:                  ubicacion.id,
      pedidoId,
      sede:                ubicacion.sede,
      ubicacion:           ubicacion.ubicacion,
      descripcion:         ubicacion.descripcion,
      actualizadoPor:      { id: ubicacion.actualizadoPor.id, nombre: ubicacion.actualizadoPor.nombre },
      ultimaActualizacion: ubicacion.ultimaActualizacion,
      historial:           historialMapeado,
    };
  }

  // ===========================================================================
  // HELPERS PRIVADOS
  // ===========================================================================

  private async _obtenerChecklistById(id: string): Promise<ChecklistDespachoDetalle> {
    const cl = await this.prisma.checklistDespacho.findUniqueOrThrow({
      where:   { id },
      include: {
        completadoPor: { select: { id: true, nombre: true } },
        items: {
          orderBy: { creadoEn: 'asc' },
          include: {
            tipoValidacionDespacho: { select: { id: true, codigo: true, nombre: true } },
          },
        },
      },
    });
    return this._mapearChecklist(cl);
  }

  private _mapearChecklist(cl: {
    id: string;
    completado: boolean;
    completadoPor: { id: string; nombre: string } | null;
    fechaCompletado: Date | null;
    observaciones: string | null;
    creadoEn: Date;
    items: Array<{
      id: string;
      aprobado: boolean;
      observaciones: string | null;
      creadoEn: Date;
      tipoValidacionDespacho: { id: string; codigo: string; nombre: string };
    }>;
  }): ChecklistDespachoDetalle {
    return {
      id:             cl.id,
      completado:     cl.completado,
      completadoPor:  cl.completadoPor
        ? { id: cl.completadoPor.id, nombre: cl.completadoPor.nombre }
        : null,
      fechaCompletado: cl.fechaCompletado,
      observaciones:  cl.observaciones,
      creadoEn:       cl.creadoEn,
      items: cl.items.map((it) => ({
        id:             it.id,
        tipoValidacion: { id: it.tipoValidacionDespacho.id, codigo: it.tipoValidacionDespacho.codigo, nombre: it.tipoValidacionDespacho.nombre },
        aprobado:       it.aprobado,
        observaciones:  it.observaciones,
        creadoEn:       it.creadoEn,
      })),
    };
  }
}
