import { PrismaServicio } from '../../../prisma/prisma.servicio';

/**
 * Cliente de transacción Prisma: PrismaServicio sin los métodos de ciclo de vida
 * y sin $transaction (que no está disponible dentro de una transacción activa).
 * Es compatible con el parámetro `tx` que entrega $transaction en sus callbacks.
 */
export type ClienteTransaccion = Omit<
  PrismaServicio,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Parámetros de entrada para el motor de estados.
 *
 * El campo `usuarioId` representa al usuario que ejecuta la acción.
 * El campo `autorizadorId` es distinto: es el usuario que aprueba la transición
 * cuando se requiere autorización de un rol diferente al ejecutante.
 */
export interface ParametrosTransicion {
  /** Módulo de negocio (ej: 'pedido', 'orden_produccion', 'pqrs') */
  modulo: string;
  /**
   * Clave del mapa de entidades. Determina qué tabla/modelo/historial
   * usar. Debe coincidir con las claves definidas en MAPA_ENTIDADES.
   */
  entidad: string;
  /** UUID del registro afectado */
  entidadId: string;
  /**
   * UUID del estado actual. Si no se provee, el motor lo lee
   * directamente desde el campo de estado de la entidad en BD.
   * Proveerlo explícitamente evita una consulta extra y permite
   * validar consistencia optimista.
   */
  estadoActualId?: string;
  /** Código del estado destino en estados_sistema */
  estadoNuevoCodigo: string;
  /** UUID del usuario que ejecuta la transición */
  usuarioId: string;
  /** UUID del rol del usuario ejecutante. Requerido para transiciones con requiereAutorizacion */
  rolId?: string;
  /**
   * UUID del usuario que autoriza la transición cuando es distinto al ejecutante.
   * El motor resolverá el rolId del autorizador desde BD para validar el permiso.
   */
  autorizadorId?: string;
  observaciones?: string;
  metadata?: Record<string, unknown>;
  /**
   * Cuando true, el motor omite la validación de transición y permite
   * cualquier cambio de estado, incluso desde estados finales.
   * Solo permitido para roles gerente y admin_punto.
   */
  forzar?: boolean;
  /**
   * Cliente de transacción externo. Cuando se provee, el motor participa en
   * la transacción existente en lugar de crear una nueva.
   *
   * Uso desde un servicio:
   *   await this.prisma.ejecutarTransaccion(async (tx) => {
   *     await otraOperacion(tx);
   *     await this.motorEstados.transicionar({ ..., tx });
   *   });
   *
   * El cast es necesario porque ejecutarTransaccion entrega Prisma.TransactionClient,
   * que es un subconjunto de ClienteTransaccion:
   *   tx: tx as ClienteTransaccion
   */
  tx?: ClienteTransaccion;
}
