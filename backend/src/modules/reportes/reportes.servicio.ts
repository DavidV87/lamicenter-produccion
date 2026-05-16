import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto';
import {
  ActividadRecienteItem,
  AuditoriaActividadResumen,
  DespachoPendienteResumen,
  DespachoPorEstado,
  EventoRecienteResumen,
  OrdenActivaResumen,
  PedidosPorEstado,
  PedidosPorSede,
  ProduccionPorEstado,
  PqrsAbiertaResumen,
  PqrsPorTipo,
  PqrsResumenMetrica,
  RequerimientoPendienteResumen,
  ResumenGeneralDashboard,
  SolicitudActivaResumen,
  TiemposPedidoResultado,
} from './interfaces/reportes.interfaces';

// ─── Constantes de códigos de estado por módulo ────────────────────────────
// Corresponden a los códigos sembrados en estados_sistema via seed.ts.
// Si cambia el seed, actualizar aquí también.

/** Pedidos aún no activos en producción */
const PEDIDO_ESTADOS_PENDIENTES = ['borrador', 'en_revision', 'validado'];
/** Pedidos en flujo activo (producción o despacho) */
const PEDIDO_ESTADOS_EN_PROCESO = ['en_produccion', 'listo_despacho', 'despachado'];
/** Estados finales de órdenes de producción */
const ORDEN_ESTADOS_FINALES = ['terminada', 'cancelada'];
/** Etapas que aún requieren trabajo */
const ETAPA_ESTADOS_ACTIVOS = ['pendiente', 'en_proceso', 'pausada'];
/** Requerimientos que aún no fueron atendidos ni rechazados */
const REQ_ESTADOS_PENDIENTES = ['pendiente', 'en_revision', 'aprobado'];
/** Solicitudes de compra en flujo no cerrado */
const SOLICITUD_ESTADOS_ACTIVOS = ['borrador', 'en_revision', 'aprobada'];
/** Despachos no entregados ni rechazados */
const DESPACHO_ESTADOS_PENDIENTES = ['pendiente', 'autorizado', 'en_cargue'];
/** Despachos completados */
const DESPACHO_ESTADOS_FINALIZADOS = ['despachado', 'entregado'];
/** PQRS en atención activa (excluye abierta) */
const PQRS_ESTADOS_EN_REVISION = ['en_revision', 'en_solucion', 'solucion_aplicada'];

@Injectable()
export class ReportesServicio {
  private readonly logger = new Logger(ReportesServicio.name);

  constructor(private readonly prisma: PrismaServicio) {}

  // ===========================================================================
  // DASHBOARD
  // ===========================================================================

  /**
   * Resumen general con métricas en tiempo real de todos los módulos.
   * Las 13 consultas de conteo corren en paralelo con Promise.all.
   * No persiste resultados: se calcula fresco en cada llamada desde PostgreSQL.
   */
  async resumenGeneral(dto: DashboardQueryDto): Promise<ResumenGeneralDashboard> {
    const { sedeId } = dto;

    const ahora = new Date();
    const inicioDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 0, 0, 0, 0);
    const finDia   = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), 23, 59, 59, 999);

    const filtroPedidoSede: Prisma.PedidoWhereInput = sedeId
      ? { OR: [{ sedeVentaId: sedeId }, { sedeResponsableId: sedeId }] }
      : {};

    const [
      totalPedidos,
      pedidosPendientes,
      pedidosEnProceso,
      pedidosCompletados,
      ordenesActivas,
      etapasActivas,
      requerimientosPendientes,
      solicitudesActivas,
      despachosPendientes,
      despachadosHoy,
      pqrsAbiertas,
      pqrsCerradas,
      pqrsEnRevision,
    ] = await Promise.all([

      // ── Pedidos ─────────────────────────────────────────────────────
      this.prisma.pedido.count({ where: filtroPedidoSede }),

      this.prisma.pedido.count({
        where: { ...filtroPedidoSede, estadoPedido: { codigo: { in: PEDIDO_ESTADOS_PENDIENTES } } },
      }),

      this.prisma.pedido.count({
        where: { ...filtroPedidoSede, estadoPedido: { codigo: { in: PEDIDO_ESTADOS_EN_PROCESO } } },
      }),

      this.prisma.pedido.count({
        where: { ...filtroPedidoSede, estadoPedido: { codigo: 'completado' } },
      }),

      // ── Producción ───────────────────────────────────────────────────
      this.prisma.ordenProduccion.count({
        where: {
          ...(sedeId ? { sedeProduccionId: sedeId } : {}),
          estadoOrden: { codigo: { notIn: ORDEN_ESTADOS_FINALES } },
        },
      }),

      this.prisma.ordenEtapa.count({
        where: {
          ...(sedeId ? { ordenProduccion: { sedeProduccionId: sedeId } } : {}),
          estadoEtapa: { codigo: { in: ETAPA_ESTADOS_ACTIVOS } },
        },
      }),

      // ── Abastecimiento ───────────────────────────────────────────────
      this.prisma.requerimientoMaterial.count({
        where: {
          ...(sedeId ? { sedeId } : {}),
          estadoRequerimiento: { codigo: { in: REQ_ESTADOS_PENDIENTES } },
        },
      }),

      this.prisma.solicitudCompra.count({
        where: {
          ...(sedeId ? { sedeId } : {}),
          estadoSolicitud: { codigo: { in: SOLICITUD_ESTADOS_ACTIVOS } },
        },
      }),

      // ── Despacho ────────────────────────────────────────────────────
      this.prisma.despacho.count({
        where: {
          ...(sedeId ? { sedeId } : {}),
          estadoDespacho: { codigo: { in: DESPACHO_ESTADOS_PENDIENTES } },
        },
      }),

      this.prisma.despacho.count({
        where: {
          ...(sedeId ? { sedeId } : {}),
          estadoDespacho: { codigo: { in: DESPACHO_ESTADOS_FINALIZADOS } },
          creadoEn: { gte: inicioDia, lte: finDia },
        },
      }),

      // ── PQRS ────────────────────────────────────────────────────────
      this.prisma.pqrs.count({ where: { estadoPqrs: { codigo: 'abierta' } } }),
      this.prisma.pqrs.count({ where: { estadoPqrs: { codigo: 'cerrada' } } }),
      this.prisma.pqrs.count({ where: { estadoPqrs: { codigo: { in: PQRS_ESTADOS_EN_REVISION } } } }),
    ]);

    return {
      pedidos: {
        total: totalPedidos,
        pendientes: pedidosPendientes,
        enProceso: pedidosEnProceso,
        completados: pedidosCompletados,
      },
      produccion: {
        ordenesActivas,
        etapasActivas,
      },
      abastecimiento: {
        requerimientosPendientes,
        solicitudesActivas,
      },
      despacho: {
        pendientes: despachosPendientes,
        despachadosHoy,
      },
      pqrs: {
        abiertas: pqrsAbiertas,
        cerradas: pqrsCerradas,
        enRevision: pqrsEnRevision,
      },
      generadoEn: new Date().toISOString(),
    };
  }

  /**
   * Actividad reciente mezclada de las 4 entidades principales.
   * Obtiene limiteEntidad registros de cada fuente en paralelo,
   * los combina, ordena por fecha desc y corta al límite solicitado.
   */
  async actividadReciente(
    dto: DashboardQueryDto,
    limite: number = 20,
  ): Promise<ActividadRecienteItem[]> {
    const limiteEntidad = limite * 2;

    const filtroPedidoSede: Prisma.PedidoWhereInput = dto.sedeId
      ? { OR: [{ sedeVentaId: dto.sedeId }, { sedeResponsableId: dto.sedeId }] }
      : {};

    const [pedidos, pqrsList, despachos, ordenes] = await Promise.all([
      this.prisma.pedido.findMany({
        where:   filtroPedidoSede,
        orderBy: { actualizadoEn: 'desc' },
        take:    limiteEntidad,
        select: {
          id:            true,
          actualizadoEn: true,
          cliente:       { select: { razonSocial: true } },
          estadoPedido:  { select: { nombre: true } },
          creadoPor:     { select: { nombre: true } },
        },
      }),

      this.prisma.pqrs.findMany({
        orderBy: { actualizadoEn: 'desc' },
        take:    limiteEntidad,
        select: {
          id:            true,
          consecutivo:   true,
          actualizadoEn: true,
          estadoPqrs:    { select: { nombre: true } },
          creadoPor:     { select: { nombre: true } },
          cliente:       { select: { razonSocial: true } },
        },
      }),

      this.prisma.despacho.findMany({
        where:   dto.sedeId ? { sedeId: dto.sedeId } : {},
        orderBy: { actualizadoEn: 'desc' },
        take:    limiteEntidad,
        select: {
          id:             true,
          actualizadoEn:  true,
          estadoDespacho: { select: { nombre: true } },
          creadoPor:      { select: { nombre: true } },
          sede:           { select: { nombre: true } },
        },
      }),

      this.prisma.ordenProduccion.findMany({
        where:   dto.sedeId ? { sedeProduccionId: dto.sedeId } : {},
        orderBy: { actualizadoEn: 'desc' },
        take:    limiteEntidad,
        select: {
          id:             true,
          actualizadoEn:  true,
          estadoOrden:    { select: { nombre: true } },
          creadoPor:      { select: { nombre: true } },
          sedeProduccion: { select: { nombre: true } },
        },
      }),
    ]);

    const actividad: ActividadRecienteItem[] = [
      ...pedidos.map((p) => ({
        tipo: 'pedido' as const,
        descripcion: `Pedido de ${p.cliente.razonSocial} — ${p.estadoPedido.nombre}`,
        fecha:       p.actualizadoEn,
        usuario:     p.creadoPor?.nombre ?? null,
        entidadId:   p.id,
      })),

      ...pqrsList.map((p) => ({
        tipo: 'pqrs' as const,
        descripcion: `PQRS ${p.consecutivo} (${p.cliente.razonSocial}) — ${p.estadoPqrs.nombre}`,
        fecha:       p.actualizadoEn,
        usuario:     p.creadoPor?.nombre ?? null,
        entidadId:   p.id,
      })),

      ...despachos.map((d) => ({
        tipo: 'despacho' as const,
        descripcion: `Despacho en ${d.sede.nombre} — ${d.estadoDespacho.nombre}`,
        fecha:       d.actualizadoEn,
        usuario:     d.creadoPor?.nombre ?? null,
        entidadId:   d.id,
      })),

      ...ordenes.map((o) => ({
        tipo: 'produccion' as const,
        descripcion: `Orden de producción en ${o.sedeProduccion.nombre} — ${o.estadoOrden.nombre}`,
        fecha:       o.actualizadoEn,
        usuario:     o.creadoPor?.nombre ?? null,
        entidadId:   o.id,
      })),
    ];

    return actividad
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, limite);
  }

  // ===========================================================================
  // PEDIDOS
  // ===========================================================================

  /**
   * Distribución de pedidos agrupada por estado.
   * GroupBy en Prisma + resolución de nombres en paralelo (2 queries).
   */
  async pedidosPorEstado(query: RangoFechasQueryDto): Promise<PedidosPorEstado[]> {
    const filtroDonde = this._buildFiltroPedido(query);

    const [grupos, estados] = await Promise.all([
      this.prisma.pedido.groupBy({
        by:    ['estadoPedidoId'],
        _count: { id: true },
        where: filtroDonde,
      }),
      this.prisma.estadoSistema.findMany({
        where:  { modulo: 'pedido' },
        select: { id: true, codigo: true, nombre: true },
      }),
    ]);

    const mapaEstados = new Map(estados.map((e) => [e.id, e]));

    return grupos
      .map((g) => ({
        estadoId: g.estadoPedidoId,
        estado:   mapaEstados.get(g.estadoPedidoId)?.nombre ?? 'Desconocido',
        codigo:   mapaEstados.get(g.estadoPedidoId)?.codigo ?? '',
        cantidad: g._count.id,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Distribución de pedidos agrupada por sede de venta.
   */
  async pedidosPorSede(query: RangoFechasQueryDto): Promise<PedidosPorSede[]> {
    const filtroDonde = this._buildFiltroPedido(query);

    const [grupos, sedes] = await Promise.all([
      this.prisma.pedido.groupBy({
        by:    ['sedeVentaId'],
        _count: { id: true },
        where: filtroDonde,
      }),
      this.prisma.sede.findMany({
        select: { id: true, nombre: true },
      }),
    ]);

    const mapaSedes = new Map(sedes.map((s) => [s.id, s.nombre]));

    return grupos
      .map((g) => ({
        sedeId:   g.sedeVentaId,
        sede:     mapaSedes.get(g.sedeVentaId) ?? 'Desconocida',
        cantidad: g._count.id,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Tiempos de ciclo de pedidos calculados directamente en PostgreSQL.
   * Usa $queryRaw para la agregación AVG(EXTRACT(EPOCH FROM ...)).
   * Excluye pedidos sin fechaDespachoCompleto del cálculo del promedio.
   *
   * Candidato V2: añadir promedioHorasCreacionAProduccion y
   * promedioHorasProduccionADespacho usando historial_estados_pedido.
   */
  async tiemposPedido(query: RangoFechasQueryDto): Promise<TiemposPedidoResultado> {
    type FilaTiempos = {
      promedio_horas_ciclo: string | null;
      total: bigint;
    };

    const [fila] = await this.prisma.$queryRaw<FilaTiempos[]>`
      SELECT
        AVG(EXTRACT(EPOCH FROM (fecha_despacho_completo - creado_en)) / 3600)::text AS promedio_horas_ciclo,
        COUNT(*) AS total
      FROM pedidos
      WHERE fecha_despacho_completo IS NOT NULL
      ${query.sedeId
        ? Prisma.sql`AND (sede_venta_id = ${query.sedeId}::uuid OR sede_responsable_id = ${query.sedeId}::uuid)`
        : Prisma.empty}
      ${query.fechaDesde
        ? Prisma.sql`AND creado_en >= ${new Date(query.fechaDesde)}`
        : Prisma.empty}
      ${query.fechaHasta
        ? Prisma.sql`AND creado_en <= ${new Date(query.fechaHasta)}`
        : Prisma.empty}
    `;

    return {
      promedioHorasTotalCiclo: fila.promedio_horas_ciclo
        ? parseFloat(fila.promedio_horas_ciclo)
        : null,
      totalConFechaCompleta: Number(fila.total),
    };
  }

  // ===========================================================================
  // PRODUCCIÓN
  // ===========================================================================

  /**
   * Distribución de órdenes de producción por estado.
   */
  async produccionPorEstado(query: RangoFechasQueryDto): Promise<ProduccionPorEstado[]> {
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.OrdenProduccionWhereInput = { ...rangoFechas };
    if (query.sedeId) filtroDonde.sedeProduccionId = query.sedeId;

    const [grupos, estados] = await Promise.all([
      this.prisma.ordenProduccion.groupBy({
        by:    ['estadoOrdenId'],
        _count: { id: true },
        where: filtroDonde,
      }),
      this.prisma.estadoSistema.findMany({
        where:  { modulo: 'orden_produccion' },
        select: { id: true, codigo: true, nombre: true },
      }),
    ]);

    const mapaEstados = new Map(estados.map((e) => [e.id, e]));

    return grupos
      .map((g) => ({
        estadoId: g.estadoOrdenId,
        estado:   mapaEstados.get(g.estadoOrdenId)?.nombre ?? 'Desconocido',
        codigo:   mapaEstados.get(g.estadoOrdenId)?.codigo ?? '',
        cantidad: g._count.id,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Listado de órdenes de producción activas ordenadas por prioridad.
   */
  async ordenesActivas(query: RangoFechasQueryDto): Promise<OrdenActivaResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.OrdenProduccionWhereInput = {
      ...rangoFechas,
      estadoOrden: { codigo: { notIn: ORDEN_ESTADOS_FINALES } },
    };
    if (query.sedeId) filtroDonde.sedeProduccionId = query.sedeId;

    const ordenes = await this.prisma.ordenProduccion.findMany({
      where:   filtroDonde,
      orderBy: { ordenPrioridad: 'desc' },
      take:    limite,
      select: {
        id:              true,
        pedidoId:        true,
        fechaInicioReal: true,
        creadoEn:        true,
        estadoOrden:     { select: { nombre: true, codigo: true } },
        sedeProduccion:  { select: { nombre: true } },
      },
    });

    return ordenes.map((o) => ({
      id:              o.id,
      pedidoId:        o.pedidoId,
      estado:          o.estadoOrden.nombre,
      codigoEstado:    o.estadoOrden.codigo,
      sedeProduccion:  o.sedeProduccion.nombre,
      fechaInicioReal: o.fechaInicioReal,
      creadoEn:        o.creadoEn,
    }));
  }

  /**
   * Eventos operativos recientes ordenados por fechaEvento desc.
   */
  async eventosRecientes(query: RangoFechasQueryDto): Promise<EventoRecienteResumen[]> {
    const limite = query.limite ?? 20;
    const filtroDonde: Prisma.EventoOperativoWhereInput = {};

    if (query.sedeId) {
      filtroDonde.OR = [
        { ordenProduccion: { sedeProduccionId: query.sedeId } },
        { suborden:        { sedeProduccionId: query.sedeId } },
      ];
    }

    if (query.fechaDesde || query.fechaHasta) {
      filtroDonde.fechaEvento = {};
      if (query.fechaDesde) filtroDonde.fechaEvento.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) filtroDonde.fechaEvento.lte = new Date(query.fechaHasta);
    }

    const eventos = await this.prisma.eventoOperativo.findMany({
      where:   filtroDonde,
      orderBy: { fechaEvento: 'desc' },
      take:    limite,
      select: {
        id:                true,
        tipoEvento:        true,
        ordenProduccionId: true,
        subordenId:        true,
        descripcion:       true,
        fechaEvento:       true,
        registradoPor:     { select: { nombre: true } },
      },
    });

    return eventos.map((e) => ({
      id:                e.id,
      tipoEvento:        e.tipoEvento,
      ordenProduccionId: e.ordenProduccionId,
      subordenId:        e.subordenId,
      descripcion:       e.descripcion,
      registradoPor:     e.registradoPor.nombre,
      fechaEvento:       e.fechaEvento,
    }));
  }

  // ===========================================================================
  // ABASTECIMIENTO
  // ===========================================================================

  /**
   * Requerimientos de material pendientes de atención.
   * Incluye estados: pendiente, en_revision, aprobado.
   */
  async requerimientosPendientes(query: RangoFechasQueryDto): Promise<RequerimientoPendienteResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.RequerimientoMaterialWhereInput = {
      ...rangoFechas,
      estadoRequerimiento: { codigo: { in: REQ_ESTADOS_PENDIENTES } },
    };
    if (query.sedeId) filtroDonde.sedeId = query.sedeId;

    const registros = await this.prisma.requerimientoMaterial.findMany({
      where:   filtroDonde,
      orderBy: { creadoEn: 'desc' },
      take:    limite,
      select: {
        id:                  true,
        tipoRequerimiento:   true,
        cantidadRequerida:   true,
        fechaRequerida:      true,
        creadoEn:            true,
        item:                { select: { nombre: true } },
        sede:                { select: { nombre: true } },
        estadoRequerimiento: { select: { nombre: true } },
      },
    });

    return registros.map((r) => ({
      id:                r.id,
      item:              r.item.nombre,
      sede:              r.sede.nombre,
      tipoRequerimiento: String(r.tipoRequerimiento),
      estado:            r.estadoRequerimiento.nombre,
      cantidadRequerida: r.cantidadRequerida.toNumber(),
      fechaRequerida:    r.fechaRequerida,
      creadoEn:          r.creadoEn,
    }));
  }

  /**
   * Solicitudes de compra en flujo activo (borrador, en_revision, aprobada).
   */
  async solicitudesActivas(query: RangoFechasQueryDto): Promise<SolicitudActivaResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.SolicitudCompraWhereInput = {
      ...rangoFechas,
      estadoSolicitud: { codigo: { in: SOLICITUD_ESTADOS_ACTIVOS } },
    };
    if (query.sedeId) filtroDonde.sedeId = query.sedeId;

    const solicitudes = await this.prisma.solicitudCompra.findMany({
      where:   filtroDonde,
      orderBy: { creadoEn: 'desc' },
      take:    limite,
      select: {
        id:              true,
        codigo:          true,
        fechaSolicitud:  true,
        creadoEn:        true,
        sede:            { select: { nombre: true } },
        proveedor:       { select: { razonSocial: true } },
        estadoSolicitud: { select: { nombre: true } },
      },
    });

    return solicitudes.map((s) => ({
      id:             s.id,
      codigo:         s.codigo,
      sede:           s.sede.nombre,
      estado:         s.estadoSolicitud.nombre,
      proveedor:      s.proveedor?.razonSocial ?? null,
      fechaSolicitud: s.fechaSolicitud,
      creadoEn:       s.creadoEn,
    }));
  }

  // ===========================================================================
  // DESPACHO
  // ===========================================================================

  /**
   * Distribución de despachos por estado.
   */
  async despachoPorEstado(query: RangoFechasQueryDto): Promise<DespachoPorEstado[]> {
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.DespachoWhereInput = { ...rangoFechas };
    if (query.sedeId) filtroDonde.sedeId = query.sedeId;

    const [grupos, estados] = await Promise.all([
      this.prisma.despacho.groupBy({
        by:    ['estadoDespachoId'],
        _count: { id: true },
        where: filtroDonde,
      }),
      this.prisma.estadoSistema.findMany({
        where:  { modulo: 'despacho' },
        select: { id: true, codigo: true, nombre: true },
      }),
    ]);

    const mapaEstados = new Map(estados.map((e) => [e.id, e]));

    return grupos
      .map((g) => ({
        estadoId: g.estadoDespachoId,
        estado:   mapaEstados.get(g.estadoDespachoId)?.nombre ?? 'Desconocido',
        codigo:   mapaEstados.get(g.estadoDespachoId)?.codigo ?? '',
        cantidad: g._count.id,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  /**
   * Despachos pendientes ordenados por fechaDespacho ascendente (más urgentes primero).
   */
  async despachosPendientes(query: RangoFechasQueryDto): Promise<DespachoPendienteResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.DespachoWhereInput = {
      ...rangoFechas,
      estadoDespacho: { codigo: { in: DESPACHO_ESTADOS_PENDIENTES } },
    };
    if (query.sedeId) filtroDonde.sedeId = query.sedeId;

    const despachos = await this.prisma.despacho.findMany({
      where:   filtroDonde,
      orderBy: { fechaDespacho: 'asc' },
      take:    limite,
      select: {
        id:             true,
        pedidoId:       true,
        fechaDespacho:  true,
        creadoEn:       true,
        sede:           { select: { nombre: true } },
        estadoDespacho: { select: { nombre: true } },
      },
    });

    return despachos.map((d) => ({
      id:            d.id,
      pedidoId:      d.pedidoId,
      sede:          d.sede.nombre,
      estado:        d.estadoDespacho.nombre,
      fechaDespacho: d.fechaDespacho,
      creadoEn:      d.creadoEn,
    }));
  }

  // ===========================================================================
  // PQRS
  // ===========================================================================

  /**
   * Métricas globales de PQRS: conteos por estado + distribución por tipo.
   * Todas las consultas corren en paralelo.
   */
  async pqrsResumen(query: RangoFechasQueryDto): Promise<PqrsResumenMetrica> {
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.PqrsWhereInput = { ...rangoFechas };

    const [total, abiertas, enRevision, cerradas, anuladas, gruposTipo, tiposNovedad] =
      await Promise.all([
        this.prisma.pqrs.count({ where: filtroDonde }),
        this.prisma.pqrs.count({
          where: { ...filtroDonde, estadoPqrs: { codigo: 'abierta' } },
        }),
        this.prisma.pqrs.count({
          where: { ...filtroDonde, estadoPqrs: { codigo: { in: PQRS_ESTADOS_EN_REVISION } } },
        }),
        this.prisma.pqrs.count({
          where: { ...filtroDonde, estadoPqrs: { codigo: 'cerrada' } },
        }),
        this.prisma.pqrs.count({
          where: { ...filtroDonde, estadoPqrs: { codigo: 'anulada' } },
        }),
        this.prisma.pqrs.groupBy({
          by:      ['tipoNovedadId'],
          _count:  { id: true },
          where:   filtroDonde,
          orderBy: { _count: { id: 'desc' } },
        }),
        this.prisma.tipoNovedad.findMany({
          select: { id: true, nombre: true },
        }),
      ]);

    const mapaTipos = new Map(tiposNovedad.map((t) => [t.id, t.nombre]));
    const porTipo: PqrsPorTipo[] = gruposTipo.map((g) => ({
      tipoNovedadId: g.tipoNovedadId,
      tipo:          mapaTipos.get(g.tipoNovedadId) ?? 'Desconocido',
      cantidad:      g._count.id,
    }));

    return { total, abiertas, enRevision, cerradas, anuladas, porTipo };
  }

  /**
   * PQRS abiertas (estados no cerrados ni anulados), ordenadas por antigüedad.
   * Incluye cálculo de diasAbierta en JavaScript (no persistido).
   */
  async pqrsAbiertas(query: RangoFechasQueryDto): Promise<PqrsAbiertaResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.PqrsWhereInput = {
      ...rangoFechas,
      estadoPqrs: { codigo: { in: ['abierta', ...PQRS_ESTADOS_EN_REVISION] } },
    };

    const ahora = new Date();
    const registros = await this.prisma.pqrs.findMany({
      where:   filtroDonde,
      orderBy: { creadoEn: 'asc' },
      take:    limite,
      select: {
        id:          true,
        consecutivo: true,
        creadoEn:    true,
        cliente:     { select: { razonSocial: true } },
        tipoNovedad: { select: { nombre: true } },
        estadoPqrs:  { select: { nombre: true } },
      },
    });

    return registros.map((p) => ({
      id:          p.id,
      consecutivo: p.consecutivo,
      cliente:     p.cliente.razonSocial,
      tipo:        p.tipoNovedad.nombre,
      estado:      p.estadoPqrs.nombre,
      diasAbierta: Math.floor((ahora.getTime() - p.creadoEn.getTime()) / (1000 * 60 * 60 * 24)),
      creadoEn:    p.creadoEn,
    }));
  }

  /**
   * Distribución de PQRS por tipo de novedad.
   */
  async pqrsPorTipo(query: RangoFechasQueryDto): Promise<PqrsPorTipo[]> {
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.PqrsWhereInput = { ...rangoFechas };

    const [grupos, tiposNovedad] = await Promise.all([
      this.prisma.pqrs.groupBy({
        by:      ['tipoNovedadId'],
        _count:  { id: true },
        where:   filtroDonde,
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.tipoNovedad.findMany({
        select: { id: true, nombre: true },
      }),
    ]);

    const mapaTipos = new Map(tiposNovedad.map((t) => [t.id, t.nombre]));

    return grupos.map((g) => ({
      tipoNovedadId: g.tipoNovedadId,
      tipo:          mapaTipos.get(g.tipoNovedadId) ?? 'Desconocido',
      cantidad:      g._count.id,
    }));
  }

  // ===========================================================================
  // AUDITORÍA
  // ===========================================================================

  /**
   * Actividad reciente de auditoría general — solo para rol gerente.
   * No expone datosAnteriores, datosNuevos ni metadata para evitar
   * filtración de información sensible a través del endpoint de reportes.
   */
  async auditoriaActividadReciente(query: RangoFechasQueryDto): Promise<AuditoriaActividadResumen[]> {
    const limite = query.limite ?? 20;
    const rangoFechas = this._rangoFechas(query);
    const filtroDonde: Prisma.AuditoriaGeneralWhereInput = { ...rangoFechas };

    const registros = await this.prisma.auditoriaGeneral.findMany({
      where:   filtroDonde,
      orderBy: { creadoEn: 'desc' },
      take:    limite,
      select: {
        id:            true,
        tablaAfectada: true,
        registroId:    true,
        accion:        true,
        creadoEn:      true,
        usuario:       { select: { nombre: true } },
        // datosAnteriores/datosNuevos/metadata excluidos intencionalmente
      },
    });

    return registros.map((r) => ({
      id:            r.id,
      tablaAfectada: r.tablaAfectada,
      registroId:    r.registroId,
      accion:        r.accion,
      usuario:       r.usuario?.nombre ?? null,
      creadoEn:      r.creadoEn,
    }));
  }

  // ===========================================================================
  // UTILIDADES PRIVADAS
  // ===========================================================================

  /**
   * Construye el filtro WHERE base para pedidos respetando sedeId y rango de fechas.
   * sedeId filtra contra sedeVentaId OR sedeResponsableId.
   */
  private _buildFiltroPedido(query: RangoFechasQueryDto): Prisma.PedidoWhereInput {
    const donde: Prisma.PedidoWhereInput = { ...this._rangoFechas(query) };

    if (query.sedeId) {
      donde.OR = [
        { sedeVentaId: query.sedeId },
        { sedeResponsableId: query.sedeId },
      ];
    }

    return donde;
  }

  /**
   * Retorna un objeto spreaddable con el filtro de rango de fechas sobre creadoEn.
   * Devuelve objeto vacío si no hay fechas, para que el spread no agregue claves.
   */
  private _rangoFechas(
    query: RangoFechasQueryDto,
  ): { creadoEn?: { gte?: Date; lte?: Date } } {
    if (!query.fechaDesde && !query.fechaHasta) return {};
    const rango: { gte?: Date; lte?: Date } = {};
    if (query.fechaDesde) rango.gte = new Date(query.fechaDesde);
    if (query.fechaHasta) rango.lte = new Date(query.fechaHasta);
    return { creadoEn: rango };
  }
}
