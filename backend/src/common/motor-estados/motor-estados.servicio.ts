import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { ParametrosTransicion } from './interfaces/parametros-transicion.interface';
import { ResultadoTransicion } from './interfaces/resultado-transicion.interface';

// ---------------------------------------------------------------
// Roles con permiso para forzar transiciones fuera del flujo normal
// ---------------------------------------------------------------
const ROLES_PUEDEN_FORZAR = ['gerente', 'admin_punto'];

// ---------------------------------------------------------------
// Parámetros internos que reciben los escritores de historial
// ---------------------------------------------------------------
interface ParametrosHistorialInterno {
  entidadId: string;
  estadoActualId: string | null | undefined;
  estadoNuevoId: string;
  usuarioId: string;
  observaciones?: string;
  metadata?: Record<string, unknown>;
}

type EscritorHistorial = (
  tx: Prisma.TransactionClient,
  parametros: ParametrosHistorialInterno,
) => Promise<void>;

// ---------------------------------------------------------------
// Configuración de entidad: todo lo que el motor necesita saber
// sobre un tipo de entidad para operar sobre ella.
// ---------------------------------------------------------------
interface ConfiguracionEntidad {
  /** Nombre del modelo en Prisma Client (camelCase exacto) */
  modeloPrisma: string;
  /** Campo de estado en el modelo Prisma (camelCase) */
  campoEstado: string;
  /** Nombre de la tabla en BD para auditoria_general.tablaAfectada */
  tablaAuditoria: string;
  /** Función que escribe el historial específico de la entidad, si existe */
  escribirHistorial?: EscritorHistorial;
}

// ---------------------------------------------------------------
// Escritores de historial por entidad.
// Cada uno refleja exactamente la estructura de su modelo Prisma:
//   - HistorialEstadoPedido, HistorialEstadoOrden, HistorialEstadoSuborden:
//       creadoPorUsuarioId nullable, metadata Json? presente
//   - HistorialEstadoPqrs:
//       creadoPorUsuarioId NOT nullable, sin campo metadata
// ---------------------------------------------------------------
const HISTORIAL_PEDIDO: EscritorHistorial = async (tx, p) => {
  await (tx as Prisma.TransactionClient & { historialEstadoPedido: { create: (a: unknown) => Promise<unknown> } })
    .historialEstadoPedido.create({
      data: {
        pedidoId: p.entidadId,
        estadoAnteriorId: p.estadoActualId ?? undefined,
        estadoNuevoId: p.estadoNuevoId,
        creadoPorUsuarioId: p.usuarioId,
        observaciones: p.observaciones ?? undefined,
        metadata: p.metadata
          ? (p.metadata as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
};

const HISTORIAL_ORDEN: EscritorHistorial = async (tx, p) => {
  await (tx as Prisma.TransactionClient & { historialEstadoOrden: { create: (a: unknown) => Promise<unknown> } })
    .historialEstadoOrden.create({
      data: {
        ordenProduccionId: p.entidadId,
        estadoAnteriorId: p.estadoActualId ?? undefined,
        estadoNuevoId: p.estadoNuevoId,
        creadoPorUsuarioId: p.usuarioId,
        observaciones: p.observaciones ?? undefined,
        metadata: p.metadata
          ? (p.metadata as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
};

const HISTORIAL_SUBORDEN: EscritorHistorial = async (tx, p) => {
  await (tx as Prisma.TransactionClient & { historialEstadoSuborden: { create: (a: unknown) => Promise<unknown> } })
    .historialEstadoSuborden.create({
      data: {
        subordenId: p.entidadId,
        estadoAnteriorId: p.estadoActualId ?? undefined,
        estadoNuevoId: p.estadoNuevoId,
        creadoPorUsuarioId: p.usuarioId,
        observaciones: p.observaciones ?? undefined,
        metadata: p.metadata
          ? (p.metadata as unknown as Prisma.InputJsonValue)
          : undefined,
      },
    });
};

const HISTORIAL_PQRS: EscritorHistorial = async (tx, p) => {
  // HistorialEstadoPqrs difiere del resto:
  //   - creadoPorUsuarioId es NOT nullable → se pasa siempre
  //   - no existe el campo metadata en esta tabla
  await (tx as Prisma.TransactionClient & { historialEstadoPqrs: { create: (a: unknown) => Promise<unknown> } })
    .historialEstadoPqrs.create({
      data: {
        pqrsId: p.entidadId,
        estadoAnteriorId: p.estadoActualId ?? undefined,
        estadoNuevoId: p.estadoNuevoId,
        creadoPorUsuarioId: p.usuarioId,
        observaciones: p.observaciones ?? undefined,
      },
    });
};

// ---------------------------------------------------------------
// Mapa central de entidades soportadas.
// Para agregar una nueva entidad: añadir una entrada aquí.
// La clave es el valor que se pasa en ParametrosTransicion.entidad.
// ---------------------------------------------------------------
const MAPA_ENTIDADES: Record<string, ConfiguracionEntidad> = {
  pedido: {
    modeloPrisma: 'pedido',
    campoEstado: 'estadoPedidoId',
    tablaAuditoria: 'pedidos',
    escribirHistorial: HISTORIAL_PEDIDO,
  },
  orden_produccion: {
    modeloPrisma: 'ordenProduccion',
    campoEstado: 'estadoOrdenId',
    tablaAuditoria: 'ordenes_produccion',
    escribirHistorial: HISTORIAL_ORDEN,
  },
  suborden: {
    modeloPrisma: 'suborden',
    campoEstado: 'estadoSubordenId',
    tablaAuditoria: 'subordenes',
    escribirHistorial: HISTORIAL_SUBORDEN,
  },
  pqrs: {
    modeloPrisma: 'pqrs',
    campoEstado: 'estadoPqrsId',
    tablaAuditoria: 'pqrs',
    escribirHistorial: HISTORIAL_PQRS,
  },
  despacho: {
    modeloPrisma: 'despacho',
    campoEstado: 'estadoDespachoId',
    tablaAuditoria: 'despachos',
  },
  solicitud_compra: {
    modeloPrisma: 'solicitudCompra',
    campoEstado: 'estadoSolicitudId',
    tablaAuditoria: 'solicitudes_compra',
  },
  compra_material: {
    modeloPrisma: 'compraMaterial',
    campoEstado: 'estadoCompraId',
    tablaAuditoria: 'compras_material',
  },
  recepcion_material: {
    modeloPrisma: 'recepcionMaterial',
    campoEstado: 'estadoRecepcionId',
    tablaAuditoria: 'recepciones_material',
  },
  traslado_material: {
    modeloPrisma: 'trasladoMaterial',
    campoEstado: 'estadoTrasladoId',
    tablaAuditoria: 'traslados_material',
  },
  requerimiento_material: {
    modeloPrisma: 'requerimientoMaterial',
    campoEstado: 'estadoRequerimientoId',
    tablaAuditoria: 'requerimientos_material',
  },
};

@Injectable()
export class MotorEstadosServicio {
  private readonly logger = new Logger(MotorEstadosServicio.name);

  constructor(private readonly prisma: PrismaServicio) {}

  /**
   * Ejecuta una transición de estado sobre cualquier entidad del sistema.
   *
   * El método:
   *  1. Resuelve la configuración de entidad del mapa
   *  2. Valida existencia del estado destino
   *  3. Lee el estado actual de la entidad
   *  4. Valida que no sea una transición al mismo estado
   *  5. Si forzar=true: valida que el rol sea gerente o admin_punto
   *  6. Si forzar=false: valida que la transición exista en transiciones_estado
   *     y que el rol esté autorizado cuando requiereAutorizacion=true
   *  7. Ejecuta en transacción: actualiza entidad + historial + auditoría
   */
  async transicionar(parametros: ParametrosTransicion): Promise<ResultadoTransicion> {
    // ── Paso 1: Resolver configuración de entidad ────────────────────────────
    const config = MAPA_ENTIDADES[parametros.entidad];
    if (!config) {
      throw new BadRequestException(
        `Entidad '${parametros.entidad}' no está registrada en el motor de estados. ` +
        `Entidades válidas: ${Object.keys(MAPA_ENTIDADES).join(', ')}`,
      );
    }

    // ── Paso 2: Buscar estado destino ────────────────────────────────────────
    const estadoNuevo = await this.prisma.estadoSistema.findUnique({
      where: {
        modulo_codigo: {
          modulo: parametros.modulo,
          codigo: parametros.estadoNuevoCodigo,
        },
      },
    });
    if (!estadoNuevo) {
      throw new BadRequestException(
        `Estado '${parametros.estadoNuevoCodigo}' no existe en el módulo '${parametros.modulo}'`,
      );
    }
    if (!estadoNuevo.activo) {
      throw new BadRequestException(
        `El estado '${parametros.estadoNuevoCodigo}' está inactivo y no puede usarse como destino`,
      );
    }

    // ── Paso 3: Obtener entidad y resolver estadoActualId ────────────────────
    // Acceso dinámico al modelo Prisma — necesario para un motor genérico.
    // El tipo es seguro en runtime porque MAPA_ENTIDADES solo registra modelos válidos.
    const modeloEntidad = (this.prisma as unknown as Record<string, {
      findUnique: (args: { where: { id: string } }) => Promise<Record<string, unknown> | null>;
    }>)[config.modeloPrisma];

    const entidad = await modeloEntidad.findUnique({
      where: { id: parametros.entidadId },
    });
    if (!entidad) {
      throw new NotFoundException(
        `${parametros.entidad} con id '${parametros.entidadId}' no existe`,
      );
    }

    // El estadoActualId puede venir explícito en los parámetros (optimización)
    // o se lee desde el campo de estado de la entidad.
    const estadoActualId: string | null =
      parametros.estadoActualId ?? (entidad[config.campoEstado] as string | null | undefined) ?? null;

    // ── Paso 4: Validar que no sea el mismo estado ───────────────────────────
    if (estadoActualId === estadoNuevo.id) {
      throw new BadRequestException(
        `La entidad ya se encuentra en el estado '${parametros.estadoNuevoCodigo}'`,
      );
    }

    // ── Paso 5: Obtener datos del estado actual ──────────────────────────────
    const estadoActual = estadoActualId
      ? await this.prisma.estadoSistema.findUnique({ where: { id: estadoActualId } })
      : null;

    // ── Paso 6: Validar forzar ───────────────────────────────────────────────
    if (parametros.forzar) {
      await this._validarPermisoDeForzar(parametros.rolId);
      this.logger.warn(
        `[MotorEstados] Transición forzada: ${parametros.entidad}=${parametros.entidadId} ` +
        `${estadoActual?.codigo ?? 'sin-estado'} → ${estadoNuevo.codigo} ` +
        `por usuario=${parametros.usuarioId}`,
      );
    } else {
      // ── Paso 7: Validaciones normales de transición ──────────────────────
      // Un estado final no admite transiciones salvo con forzar=true
      if (estadoActual?.esEstadoFinal) {
        throw new BadRequestException(
          `El estado '${estadoActual.codigo}' es un estado final. ` +
          `No se permiten transiciones desde estados finales. Use forzar=true si tiene el rol requerido.`,
        );
      }

      // Si la entidad tiene estado actual, la transición debe existir en BD
      if (estadoActualId) {
        await this._validarTransicion(estadoActualId, estadoNuevo.id, parametros);
      }
      // Si estadoActualId es null: transición inicial (creación) — se permite sin validar arco
    }

    // ── Paso 8: Ejecutar en transacción ─────────────────────────────────────
    // Si el caller provee tx, el motor participa en su transacción existente.
    // Si no, crea una transacción propia para garantizar atomicidad.
    const payload = { config, parametros, estadoActualId, estadoActual, estadoNuevo };

    if (parametros.tx) {
      return this._ejecutarEnTransaccion(parametros.tx, payload);
    }
    return this.prisma.ejecutarTransaccion((tx) =>
      this._ejecutarEnTransaccion(tx, payload),
    );
  }

  // ---------------------------------------------------------------
  // Validaciones privadas
  // ---------------------------------------------------------------

  /**
   * Verifica que el rol del usuario esté autorizado para forzar una transición.
   * Requiere que rolId esté presente y pertenezca a gerente o admin_punto.
   */
  private async _validarPermisoDeForzar(rolId?: string): Promise<void> {
    if (!rolId) {
      throw new ForbiddenException(
        'Para forzar una transición se debe proveer rolId del usuario ejecutante',
      );
    }
    const rol = await this.prisma.rol.findUnique({
      where: { id: rolId },
      select: { nombre: true, activo: true },
    });
    if (!rol || !rol.activo) {
      throw new ForbiddenException('El rol del usuario no existe o está inactivo');
    }
    if (!ROLES_PUEDEN_FORZAR.includes(rol.nombre)) {
      throw new ForbiddenException(
        `Solo los roles [${ROLES_PUEDEN_FORZAR.join(', ')}] pueden forzar transiciones. ` +
        `Rol actual: '${rol.nombre}'`,
      );
    }
  }

  /**
   * Valida que el arco estadoActualId → estadoNuevoId exista en transiciones_estado
   * y que el rol esté autorizado cuando requiereAutorizacion=true.
   */
  private async _validarTransicion(
    estadoActualId: string,
    estadoNuevoId: string,
    parametros: ParametrosTransicion,
  ): Promise<void> {
    const transicion = await this.prisma.transicionEstado.findUnique({
      where: {
        estadoOrigenId_estadoDestinoId: {
          estadoOrigenId: estadoActualId,
          estadoDestinoId: estadoNuevoId,
        },
      },
      include: {
        rolesAutorizados: { select: { rolId: true } },
        estadoOrigen: { select: { codigo: true } },
        estadoDestino: { select: { codigo: true } },
      },
    });

    if (!transicion || !transicion.activo) {
      const estadoOrigenCodigo =
        transicion?.estadoOrigen.codigo ?? estadoActualId;
      const estadoDestinoCodigo =
        transicion?.estadoDestino.codigo ?? estadoNuevoId;
      throw new BadRequestException(
        `Transición no válida: '${estadoOrigenCodigo}' → '${estadoDestinoCodigo}' ` +
        `no existe o está inactiva`,
      );
    }

    if (transicion.requiereAutorizacion) {
      await this._validarRolAutorizado(transicion, parametros);
    }
  }

  /**
   * Valida que el rol ejecutante o autorizador esté en transiciones_roles_autorizados.
   * Si autorizadorId está presente, se usa el rol del autorizador (busca desde BD).
   * Si no, se usa el rolId del ejecutante de la transición.
   */
  private async _validarRolAutorizado(
    transicion: {
      id: string;
      rolesAutorizados: { rolId: string }[];
      estadoOrigen: { codigo: string };
      estadoDestino: { codigo: string };
    },
    parametros: ParametrosTransicion,
  ): Promise<void> {
    let rolIdParaValidar: string | undefined;

    if (parametros.autorizadorId) {
      // Autorización delegada — se verifica el rol del autorizador
      const autorizador = await this.prisma.usuario.findUnique({
        where: { id: parametros.autorizadorId },
        select: { rolId: true, activo: true },
      });
      if (!autorizador || !autorizador.activo) {
        throw new ForbiddenException(
          `El autorizador '${parametros.autorizadorId}' no existe o está inactivo`,
        );
      }
      rolIdParaValidar = autorizador.rolId;
    } else {
      rolIdParaValidar = parametros.rolId;
    }

    if (!rolIdParaValidar) {
      throw new ForbiddenException(
        `La transición '${transicion.estadoOrigen.codigo}' → '${transicion.estadoDestino.codigo}' ` +
        `requiere autorización. Debe proveer rolId o autorizadorId`,
      );
    }

    const estaAutorizado = transicion.rolesAutorizados.some(
      (ra) => ra.rolId === rolIdParaValidar,
    );
    if (!estaAutorizado) {
      throw new ForbiddenException(
        `El rol no está autorizado para la transición ` +
        `'${transicion.estadoOrigen.codigo}' → '${transicion.estadoDestino.codigo}'`,
      );
    }
  }

  // ---------------------------------------------------------------
  // Ejecución transaccional
  // ---------------------------------------------------------------

  /**
   * Contiene las tres escrituras que deben ser atómicas:
   *   1. Actualizar campo de estado en la entidad
   *   2. Escribir historial específico (si la entidad lo tiene)
   *   3. Escribir auditoria_general con CAMBIO_ESTADO
   *
   * Se ejecuta siempre dentro de prisma.ejecutarTransaccion().
   * La auditoría se escribe directamente en tx (no vía AuditoriaServicio)
   * para garantizar atomicidad — si la auditoría falla, toda la transacción falla.
   */
  private async _ejecutarEnTransaccion(
    tx: Prisma.TransactionClient,
    datos: {
      config: ConfiguracionEntidad;
      parametros: ParametrosTransicion;
      estadoActualId: string | null;
      estadoActual: { id: string; codigo: string; nombre: string } | null;
      estadoNuevo: { id: string; codigo: string; nombre: string };
    },
  ): Promise<ResultadoTransicion> {
    const { config, parametros, estadoActualId, estadoActual, estadoNuevo } = datos;

    // 1. Actualizar estado en la entidad (acceso dinámico tipado como any)
    await (tx as unknown as Record<string, {
      update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
    }>)[config.modeloPrisma].update({
      where: { id: parametros.entidadId },
      data: { [config.campoEstado]: estadoNuevo.id },
    });

    // 2. Escribir historial específico si la entidad lo tiene
    if (config.escribirHistorial) {
      await config.escribirHistorial(tx, {
        entidadId: parametros.entidadId,
        estadoActualId,
        estadoNuevoId: estadoNuevo.id,
        usuarioId: parametros.usuarioId,
        observaciones: parametros.observaciones,
        metadata: parametros.metadata,
      });
    }

    // 3. Escribir auditoría transaccional (directa en tx, no via AuditoriaServicio)
    // Si esta escritura falla, toda la transacción falla — comportamiento deseado
    // para garantizar que cada cambio de estado tenga su registro de auditoría.
    const metadataAuditoria: Record<string, unknown> = {
      modulo: parametros.modulo,
      entidad: parametros.entidad,
      forzado: parametros.forzar ?? false,
    };
    if (parametros.observaciones) {
      metadataAuditoria.observaciones = parametros.observaciones;
    }
    if (parametros.metadata) {
      Object.assign(metadataAuditoria, parametros.metadata);
    }

    await tx.auditoriaGeneral.create({
      data: {
        tablaAfectada: config.tablaAuditoria,
        registroId: parametros.entidadId,
        accion: TipoAccionAuditoria.CAMBIO_ESTADO,
        datosAnteriores: estadoActual
          ? ({ estadoId: estadoActual.id, estadoCodigo: estadoActual.codigo } as unknown as Prisma.InputJsonValue)
          : undefined,
        datosNuevos: {
          estadoId: estadoNuevo.id,
          estadoCodigo: estadoNuevo.codigo,
        } as unknown as Prisma.InputJsonValue,
        metadata: metadataAuditoria as unknown as Prisma.InputJsonValue,
        usuarioId: parametros.usuarioId,
      },
    });

    return {
      entidadId: parametros.entidadId,
      estadoAnteriorId: estadoActual?.id ?? null,
      estadoAnteriorCodigo: estadoActual?.codigo ?? null,
      estadoAnteriorNombre: estadoActual?.nombre ?? null,
      estadoNuevoId: estadoNuevo.id,
      estadoNuevoCodigo: estadoNuevo.codigo,
      estadoNuevoNombre: estadoNuevo.nombre,
    };
  }
}
