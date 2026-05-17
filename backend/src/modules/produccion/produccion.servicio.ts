import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';
import { MotorEstadosServicio } from '../../common/motor-estados/motor-estados.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { ResultadoTransicion } from '../../common/motor-estados/interfaces/resultado-transicion.interface';

import { CrearOrdenProduccionDto } from './dto/crear-orden-produccion.dto';
import { ListarOrdenesQueryDto } from './dto/listar-ordenes-query.dto';
import { CambiarEstadoOrdenDto } from './dto/cambiar-estado-orden.dto';
import { CrearOrdenEtapaDto } from './dto/crear-orden-etapa.dto';
import { AsignarOrdenEtapaDto } from './dto/asignar-orden-etapa.dto';
import { CrearEventoOperativoDto } from './dto/crear-evento-operativo.dto';

import {
  ListaPaginadaOrdenes,
  OrdenProduccionResumen,
} from './interfaces/orden-produccion-lista.interface';
import {
  AsignacionOrdenResumen,
  EventoOperativoResumen,
  OrdenEtapaResumen,
  OrdenProduccionDetalle,
} from './interfaces/orden-produccion-detalle.interface';

@Injectable()
export class ProduccionServicio {
  private readonly logger = new Logger(ProduccionServicio.name);

  constructor(
    private readonly prisma: PrismaServicio,
    private readonly auditoria: AuditoriaServicio,
    private readonly motorEstados: MotorEstadosServicio,
  ) {}

  // ---------------------------------------------------------------------------
  // Crear orden de producción
  // ---------------------------------------------------------------------------

  /**
   * Crea una orden de producción asociada a un pedido existente.
   *
   * Reglas de negocio:
   *   - El pedido debe existir en BD.
   *   - La orden nace en el estado inicial 'creada' del módulo 'orden_produccion'.
   *   - generadaAutomaticamente = false (la generación automática no está en V1).
   *   - La creación y su auditoría se ejecutan en una sola transacción.
   */
  async crearOrden(
    dto: CrearOrdenProduccionDto,
    usuario: UsuarioJwt,
  ): Promise<OrdenProduccionDetalle> {
    // Verificar que el pedido exista
    const pedidoExiste = await this.prisma.pedido.findUnique({
      where: { id: dto.pedidoId },
      select: { id: true },
    });
    if (!pedidoExiste) {
      throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }

    // El estado inicial de las órdenes de producción es 'creada'
    const estadoInicial = await this.prisma.estadoSistema.findUniqueOrThrow({
      where: { modulo_codigo: { modulo: 'orden_produccion', codigo: 'creada' } },
    });

    const orden = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevaOrden = await tx.ordenProduccion.create({
        data: {
          pedidoId:               dto.pedidoId,
          sedeProduccionId:       dto.sedeProduccionId,
          sedeActualId:           dto.sedeActualId,
          sedeDespachoId:         dto.sedeDespachoId,
          maquinaPrincipalId:     dto.maquinaPrincipalId,
          estadoOrdenId:          estadoInicial.id,
          creadoPorUsuarioId:     usuario.sub,
          ordenPrioridad:         dto.ordenPrioridad ?? 0,
          generadaAutomaticamente: false,
          fechaInicioPlaneada:    dto.fechaInicioPlaneada ? new Date(dto.fechaInicioPlaneada) : null,
          fechaFinPlaneada:       dto.fechaFinPlaneada    ? new Date(dto.fechaFinPlaneada)    : null,
          observaciones:          dto.observaciones,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'ordenes_produccion',
          registroId:    nuevaOrden.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            pedidoId:         dto.pedidoId,
            sedeProduccionId: dto.sedeProduccionId,
            sedeActualId:     dto.sedeActualId,
            estadoCodigo:     estadoInicial.codigo,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevaOrden;
    });

    this.logger.log(
      `[ProduccionServicio] Orden creada: id=${orden.id} pedido=${dto.pedidoId} por usuario=${usuario.sub}`,
    );

    return this.obtenerOrden(orden.id);
  }

  // ---------------------------------------------------------------------------
  // Listar órdenes con filtros y paginación
  // ---------------------------------------------------------------------------

  async listarOrdenes(
    query: ListarOrdenesQueryDto,
    _usuario: UsuarioJwt,
  ): Promise<ListaPaginadaOrdenes> {
    const pagina = query.pagina ?? 1;
    const limite  = query.limite  ?? 20;
    const saltar  = (pagina - 1) * limite;

    const donde: Prisma.OrdenProduccionWhereInput = {};

    if (query.pedidoId)       donde.pedidoId       = query.pedidoId;
    if (query.sedeProduccionId) donde.sedeProduccionId = query.sedeProduccionId;
    if (query.estadoOrdenId)  donde.estadoOrdenId  = query.estadoOrdenId;
    if (query.busqueda) {
      donde.OR = [
        { observaciones: { contains: query.busqueda, mode: 'insensitive' } },
        { pedido: { observaciones: { contains: query.busqueda, mode: 'insensitive' } } },
      ];
    }

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.ordenProduccion.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        // Menor prioridad primero; desempate por fecha de creación descendente
        orderBy: [{ ordenPrioridad: 'asc' }, { creadoEn: 'desc' }],
        include: {
          sedeProduccion:   { select: { id: true, nombre: true } },
          sedeActual:       { select: { id: true, nombre: true } },
          sedeDespacho:     { select: { id: true, nombre: true } },
          maquinaPrincipal: { select: { id: true, nombre: true, codigo: true } },
          estadoOrden:      { select: { id: true, codigo: true, nombre: true } },
          creadoPor:        { select: { id: true, nombre: true } },
        },
      }),
      this.prisma.ordenProduccion.count({ where: donde }),
    ]);

    const datos: OrdenProduccionResumen[] = registros.map((o) => ({
      id:               o.id,
      pedidoId:         o.pedidoId,
      sedeProduccion:   { id: o.sedeProduccion.id,   nombre: o.sedeProduccion.nombre },
      sedeActual:       { id: o.sedeActual.id,       nombre: o.sedeActual.nombre },
      sedeDespacho:     o.sedeDespacho   ? { id: o.sedeDespacho.id,   nombre: o.sedeDespacho.nombre }   : null,
      maquinaPrincipal: o.maquinaPrincipal
        ? { id: o.maquinaPrincipal.id, nombre: o.maquinaPrincipal.nombre, codigo: o.maquinaPrincipal.codigo }
        : null,
      estado:           { id: o.estadoOrden.id, codigo: o.estadoOrden.codigo, nombre: o.estadoOrden.nombre },
      creadoPor:        { id: o.creadoPor.id, nombre: o.creadoPor.nombre },
      ordenPrioridad:   o.ordenPrioridad,
      fechaInicioPlaneada: o.fechaInicioPlaneada,
      fechaFinPlaneada:    o.fechaFinPlaneada,
      observaciones:    o.observaciones,
      creadoEn:         o.creadoEn,
      actualizadoEn:    o.actualizadoEn,
    }));

    return {
      datos,
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  // ---------------------------------------------------------------------------
  // Obtener detalle completo de una orden
  // ---------------------------------------------------------------------------

  async obtenerOrden(id: string): Promise<OrdenProduccionDetalle> {
    const orden = await this.prisma.ordenProduccion.findUnique({
      where: { id },
      include: {
        sedeProduccion:   { select: { id: true, nombre: true } },
        sedeActual:       { select: { id: true, nombre: true } },
        sedeDespacho:     { select: { id: true, nombre: true } },
        maquinaPrincipal: { select: { id: true, nombre: true, codigo: true } },
        estadoOrden:      { select: { id: true, codigo: true, nombre: true } },
        creadoPor:        { select: { id: true, nombre: true } },
        etapas: {
          orderBy: { creadoEn: 'asc' },
          include: {
            etapaProduccion: { select: { id: true, nombre: true, codigo: true, orden: true } },
            estadoEtapa:     { select: { id: true, codigo: true, nombre: true } },
            _count:          { select: { asignaciones: true } },
          },
        },
      },
    });

    if (!orden) {
      throw new NotFoundException(`Orden de producción ${id} no encontrada`);
    }

    const etapas: OrdenEtapaResumen[] = orden.etapas.map((e) => ({
      id:               e.id,
      etapaProduccion:  {
        id:     e.etapaProduccion.id,
        nombre: e.etapaProduccion.nombre,
        codigo: e.etapaProduccion.codigo,
        orden:  e.etapaProduccion.orden,
      },
      estadoEtapa:        { id: e.estadoEtapa.id, codigo: e.estadoEtapa.codigo, nombre: e.estadoEtapa.nombre },
      fechaInicio:        e.fechaInicio,
      fechaFin:           e.fechaFin,
      observaciones:      e.observaciones,
      totalAsignaciones:  e._count.asignaciones,
      creadoEn:           e.creadoEn,
    }));

    return {
      id:                     orden.id,
      pedido:                 { id: orden.pedidoId },
      sedeProduccion:         { id: orden.sedeProduccion.id,   nombre: orden.sedeProduccion.nombre },
      sedeActual:             { id: orden.sedeActual.id,       nombre: orden.sedeActual.nombre },
      sedeDespacho:           orden.sedeDespacho
        ? { id: orden.sedeDespacho.id, nombre: orden.sedeDespacho.nombre }
        : null,
      maquinaPrincipal:       orden.maquinaPrincipal
        ? { id: orden.maquinaPrincipal.id, nombre: orden.maquinaPrincipal.nombre, codigo: orden.maquinaPrincipal.codigo }
        : null,
      estado:                 { id: orden.estadoOrden.id, codigo: orden.estadoOrden.codigo, nombre: orden.estadoOrden.nombre },
      creadoPor:              { id: orden.creadoPor.id, nombre: orden.creadoPor.nombre },
      ordenPrioridad:         orden.ordenPrioridad,
      generadaAutomaticamente: orden.generadaAutomaticamente,
      fechaInicioPlaneada:    orden.fechaInicioPlaneada,
      fechaFinPlaneada:       orden.fechaFinPlaneada,
      fechaInicioReal:        orden.fechaInicioReal,
      fechaFinReal:           orden.fechaFinReal,
      observaciones:          orden.observaciones,
      metadata:               orden.metadata as Record<string, unknown> | null,
      etapas,
      creadoEn:               orden.creadoEn,
      actualizadoEn:          orden.actualizadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Cambiar estado de una orden via motor de estados
  // ---------------------------------------------------------------------------

  /**
   * Delega la transición al MotorEstadosServicio.
   * El motor valida: existencia del estado destino, arco de transición, rol autorizado
   * y escribe historial_estados_orden + auditoria_general en una sola transacción.
   */
  async cambiarEstadoOrden(
    id: string,
    dto: CambiarEstadoOrdenDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoTransicion> {
    await this.verificarOrdenExiste(id);

    return this.motorEstados.transicionar({
      modulo:            'orden_produccion',
      entidad:           'orden_produccion',
      entidadId:         id,
      estadoNuevoCodigo: dto.estadoNuevoCodigo,
      usuarioId:         usuario.sub,
      rolId:             usuario.rolId,
      observaciones:     dto.observaciones,
      metadata:          dto.metadata,
      forzar:            dto.forzar,
    });
  }

  // ---------------------------------------------------------------------------
  // Agregar etapa a una orden de producción
  // ---------------------------------------------------------------------------

  /**
   * Crea una OrdenEtapa asociada a la orden (ordenProduccionId = id, subordenId = null).
   * La XOR constraint de BD se respeta: solo se asigna ordenProduccionId.
   *
   * Si no se especifica estadoEtapaCodigo, se usa el estado inicial 'pendiente'
   * del módulo 'etapa_produccion'.
   */
  async crearEtapa(
    ordenId: string,
    dto: CrearOrdenEtapaDto,
    usuario: UsuarioJwt,
  ): Promise<OrdenEtapaResumen> {
    await this.verificarOrdenExiste(ordenId);

    // Verificar que la etapa de producción exista en el catálogo
    const etapaCatalogo = await this.prisma.etapaProduccion.findUnique({
      where: { id: dto.etapaProduccionId },
      select: { id: true, nombre: true, codigo: true, orden: true, activo: true },
    });
    if (!etapaCatalogo || !etapaCatalogo.activo) {
      throw new NotFoundException(
        `Etapa de producción ${dto.etapaProduccionId} no encontrada o inactiva`,
      );
    }

    // Resolver el estado de la etapa (por código o estado inicial por defecto)
    const codigoEstado = dto.estadoEtapaCodigo ?? 'pendiente';
    const estadoEtapa = await this.prisma.estadoSistema.findUnique({
      where: { modulo_codigo: { modulo: 'etapa_produccion', codigo: codigoEstado } },
    });
    if (!estadoEtapa) {
      throw new BadRequestException(
        `Estado '${codigoEstado}' no existe en el módulo 'etapa_produccion'`,
      );
    }

    const etapa = await this.prisma.ejecutarTransaccion(async (tx) => {
      // XOR garantizado: ordenProduccionId = ordenId, subordenId = null (omitido → Prisma lo deja null)
      const nuevaEtapa = await tx.ordenEtapa.create({
        data: {
          ordenProduccionId: ordenId,
          etapaProduccionId: dto.etapaProduccionId,
          estadoEtapaId:     estadoEtapa.id,
          observaciones:     dto.observaciones,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'orden_etapas',
          registroId:    nuevaEtapa.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            ordenProduccionId: ordenId,
            etapaProduccionId: dto.etapaProduccionId,
            estadoCodigo:      estadoEtapa.codigo,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevaEtapa;
    });

    return {
      id:               etapa.id,
      etapaProduccion:  {
        id:     etapaCatalogo.id,
        nombre: etapaCatalogo.nombre,
        codigo: etapaCatalogo.codigo,
        orden:  etapaCatalogo.orden,
      },
      estadoEtapa:       { id: estadoEtapa.id, codigo: estadoEtapa.codigo, nombre: estadoEtapa.nombre },
      fechaInicio:       null,
      fechaFin:          null,
      observaciones:     etapa.observaciones,
      totalAsignaciones: 0,
      creadoEn:          etapa.creadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Asignar operador a una etapa de orden
  // ---------------------------------------------------------------------------

  /**
   * Asigna un operador (y opcionalmente una máquina) a una etapa de orden.
   *
   * Regla de reasignación (historial inmutable):
   *   - Se cierra la asignación activa anterior (fechaFinAsignacion IS NULL) antes de crear la nueva.
   *   - NO se sobrescribe el registro anterior: el historial de asignaciones queda completo.
   *   - La asignación activa en cualquier momento es la que tenga fechaFinAsignacion = null.
   */
  async asignarEtapa(
    etapaId: string,
    dto: AsignarOrdenEtapaDto,
    usuario: UsuarioJwt,
  ): Promise<AsignacionOrdenResumen> {
    // Verificar que la etapa exista
    const ordenEtapa = await this.prisma.ordenEtapa.findUnique({
      where: { id: etapaId },
      select: { id: true },
    });
    if (!ordenEtapa) {
      throw new NotFoundException(`Etapa de orden ${etapaId} no encontrada`);
    }

    // Verificar que el operador exista y esté activo
    const operador = await this.prisma.usuario.findUnique({
      where: { id: dto.operadorId },
      select: { id: true, nombre: true, activo: true },
    });
    if (!operador || !operador.activo) {
      throw new NotFoundException(
        `Operador ${dto.operadorId} no encontrado o inactivo`,
      );
    }

    const fechaInicio = dto.fechaInicioAsignacion
      ? new Date(dto.fechaInicioAsignacion)
      : new Date();

    const asignacion = await this.prisma.ejecutarTransaccion(async (tx) => {
      // Cerrar asignación activa anterior (si existe) antes de crear la nueva
      await tx.ordenAsignacion.updateMany({
        where:  { ordenEtapaId: etapaId, fechaFinAsignacion: null },
        data:   { fechaFinAsignacion: fechaInicio },
      });

      const nuevaAsignacion = await tx.ordenAsignacion.create({
        data: {
          ordenEtapaId:         etapaId,
          operadorId:           dto.operadorId,
          maquinaId:            dto.maquinaId,
          asignadoPorUsuarioId: usuario.sub,
          fechaInicioAsignacion: fechaInicio,
          motivo:               dto.motivo,
          observaciones:        dto.observaciones,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'orden_asignaciones',
          registroId:    nuevaAsignacion.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            ordenEtapaId: etapaId,
            operadorId:   dto.operadorId,
            maquinaId:    dto.maquinaId ?? null,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevaAsignacion;
    });

    return {
      id:                    asignacion.id,
      ordenEtapaId:          etapaId,
      operador:              { id: operador.id, nombre: operador.nombre },
      maquinaId:             asignacion.maquinaId,
      asignadoPorUsuarioId:  usuario.sub,
      fechaInicioAsignacion: asignacion.fechaInicioAsignacion,
      fechaFinAsignacion:    asignacion.fechaFinAsignacion,
      motivo:                asignacion.motivo,
      observaciones:         asignacion.observaciones,
      creadoEn:              asignacion.creadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Registrar evento operativo (inmutable)
  // ---------------------------------------------------------------------------

  /**
   * Crea un registro de evento operativo.
   *
   * RESTRICCIÓN XOR: exactamente uno de (ordenProduccionId, subordenId) debe estar presente.
   * Se valida en servicio porque Prisma 5 no puede expresar CHECK constraints de XOR.
   *
   * Los eventos son INMUTABLES: no tienen actualizadoEn, no se modifican ni eliminan.
   */
  async crearEvento(
    dto: CrearEventoOperativoDto,
    usuario: UsuarioJwt,
  ): Promise<EventoOperativoResumen> {
    const tieneOrden    = !!dto.ordenProduccionId;
    const tieneSuborden = !!dto.subordenId;

    // Validar XOR: exactamente uno debe estar presente
    if (tieneOrden === tieneSuborden) {
      throw new BadRequestException(
        'Debe especificar exactamente uno de los campos: ordenProduccionId o subordenId ' +
        '(nunca ambos ni ninguno al mismo tiempo)',
      );
    }

    if (tieneOrden) {
      const ordenExiste = await this.prisma.ordenProduccion.findUnique({
        where: { id: dto.ordenProduccionId },
        select: { id: true },
      });
      if (!ordenExiste) {
        throw new NotFoundException(
          `Orden de producción ${dto.ordenProduccionId} no encontrada`,
        );
      }
    }

    if (tieneSuborden) {
      const subordenExiste = await this.prisma.suborden.findUnique({
        where: { id: dto.subordenId },
        select: { id: true },
      });
      if (!subordenExiste) {
        throw new NotFoundException(`Suborden ${dto.subordenId} no encontrada`);
      }
    }

    const fechaEvento = dto.fechaEvento ? new Date(dto.fechaEvento) : new Date();

    const evento = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevoEvento = await tx.eventoOperativo.create({
        data: {
          ordenProduccionId: dto.ordenProduccionId,
          subordenId:        dto.subordenId,
          tipoEvento:        dto.tipoEvento,
          descripcion:       dto.descripcion,
          registradoPorId:   usuario.sub,
          fechaEvento,
          metadata: dto.metadata
            ? (dto.metadata as unknown as Prisma.InputJsonValue)
            : undefined,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'eventos_operativos',
          registroId:    nuevoEvento.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            tipoEvento:        dto.tipoEvento,
            ordenProduccionId: dto.ordenProduccionId ?? null,
            subordenId:        dto.subordenId         ?? null,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevoEvento;
    });

    return {
      id:            evento.id,
      tipoEvento:    evento.tipoEvento,
      descripcion:   evento.descripcion,
      registradoPor: { id: usuario.sub, nombre: usuario.nombre },
      fechaEvento:   evento.fechaEvento,
      metadata:      evento.metadata as Record<string, unknown> | null,
      creadoEn:      evento.creadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Listar eventos de una orden de producción
  // ---------------------------------------------------------------------------

  async listarEventos(ordenId: string): Promise<EventoOperativoResumen[]> {
    await this.verificarOrdenExiste(ordenId);

    const eventos = await this.prisma.eventoOperativo.findMany({
      where:   { ordenProduccionId: ordenId },
      orderBy: { fechaEvento: 'asc' },
      include: {
        registradoPor: { select: { id: true, nombre: true } },
      },
    });

    return eventos.map((e) => ({
      id:            e.id,
      tipoEvento:    e.tipoEvento,
      descripcion:   e.descripcion,
      registradoPor: { id: e.registradoPor.id, nombre: e.registradoPor.nombre },
      fechaEvento:   e.fechaEvento,
      metadata:      e.metadata as Record<string, unknown> | null,
      creadoEn:      e.creadoEn,
    }));
  }

  // ---------------------------------------------------------------------------
  // Utilidades privadas
  // ---------------------------------------------------------------------------

  private async verificarOrdenExiste(id: string): Promise<void> {
    const existe = await this.prisma.ordenProduccion.findUnique({
      where:  { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException(`Orden de producción ${id} no encontrada`);
    }
  }
}
