/**
 * seed.ts — Datos base mínimos para el sistema Lamicenter
 *
 * Idempotente: puede ejecutarse múltiples veces sin duplicar datos.
 * Orden de ejecución obligatorio (dependencias entre tablas):
 *   1. sedes
 *   2. roles
 *   3. permisos
 *   4. rolesPermisos
 *   5. estadosSistema
 *   6. transicionesEstado + transicionesRolesAutorizados
 *   7. usuarioAdmin
 *   8. tiposItem
 *   9. tiposDocumento
 *  10. tiposNovedad
 *  11. etapasProduccion
 *  12. tiposValidacionDespacho
 */

import {
  PrismaClient,
  ComportamientoTipoItem,
  AplicaNovedadA,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// =============================================================================
// CONSTANTES — ningún string mágico disperso en el código
// =============================================================================

const SALT_ROUNDS = 12;

/** Códigos internos de sede */
const CODIGO_SEDE = {
  CR9:  'CR9',
  CL17: 'CL17',
} as const;

/** Nombres canónicos de roles */
const NOMBRE_ROL = {
  GERENTE:     'gerente',
  ADMIN_PUNTO: 'admin_punto',
  VENDEDOR:    'vendedor',
  COORDINADOR: 'coordinador',
  COMPRAS:     'compras',
  PRODUCCION:  'produccion',
  DESPACHO:    'despacho',
} as const;

/** Módulos de permisos disponibles */
const MODULO_PERMISO = [
  'seguridad',
  'catalogo',
  'documentos',
  'pedidos',
  'produccion',
  'abastecimiento',
  'despacho',
  'notificaciones',
  'pqrs',
] as const;

/** Acciones disponibles por módulo */
const ACCION_PERMISO = [
  'ver',
  'crear',
  'editar',
  'cambiar_estado',
  'autorizar',
  'anular',
] as const;

/** Nombres de módulo de estados del sistema */
const MODULO_ESTADO = {
  PEDIDO:                 'pedido',
  ORDEN_PRODUCCION:       'orden_produccion',
  SUBORDEN:               'suborden',
  ETAPA_PRODUCCION:       'etapa_produccion',
  DESPACHO:               'despacho',
  PQRS:                   'pqrs',
  SOLICITUD_COMPRA:       'solicitud_compra',
  COMPRA_MATERIAL:        'compra_material',
  RECEPCION_MATERIAL:     'recepcion_material',
  TRASLADO_MATERIAL:      'traslado_material',
  REQUERIMIENTO_MATERIAL: 'requerimiento_material',
} as const;

// =============================================================================
// DATOS ESTÁTICOS
// =============================================================================

const datosSedes = [
  { nombre: 'CR9',  codigo: CODIGO_SEDE.CR9,  direccion: 'Carrera 9 — Sede principal' },
  { nombre: 'CL17', codigo: CODIGO_SEDE.CL17, direccion: 'Calle 17 — Sede secundaria' },
];

const datosRoles = [
  { nombre: NOMBRE_ROL.GERENTE,     descripcion: 'Gerencia — acceso total al sistema' },
  { nombre: NOMBRE_ROL.ADMIN_PUNTO, descripcion: 'Administrador de punto de venta y producción' },
  { nombre: NOMBRE_ROL.VENDEDOR,    descripcion: 'Asesor comercial y gestor de pedidos' },
  { nombre: NOMBRE_ROL.COORDINADOR, descripcion: 'Coordinador de producción y logística' },
  { nombre: NOMBRE_ROL.COMPRAS,     descripcion: 'Gestión de compras y abastecimiento' },
  { nombre: NOMBRE_ROL.PRODUCCION,  descripcion: 'Operario de planta y producción' },
  { nombre: NOMBRE_ROL.DESPACHO,    descripcion: 'Encargado de despachos y entregas' },
];

/** Permisos propios de cada rol. Gerente y admin_punto reciben todos. */
const permisosPorRol: Record<string, string[]> = {
  [NOMBRE_ROL.VENDEDOR]: [
    'documentos.ver', 'documentos.crear', 'documentos.editar', 'documentos.cambiar_estado',
    'pedidos.ver', 'pedidos.crear', 'pedidos.editar', 'pedidos.cambiar_estado',
    'catalogo.ver',
    'pqrs.ver', 'pqrs.crear',
  ],
  [NOMBRE_ROL.COORDINADOR]: [
    'pedidos.ver', 'pedidos.crear', 'pedidos.editar',
    'pedidos.cambiar_estado', 'pedidos.autorizar', 'pedidos.anular',
    'produccion.ver', 'produccion.crear', 'produccion.editar',
    'produccion.cambiar_estado', 'produccion.autorizar', 'produccion.anular',
    'despacho.ver',
    'catalogo.ver',
    'pqrs.ver', 'pqrs.cambiar_estado', 'pqrs.autorizar',
  ],
  [NOMBRE_ROL.COMPRAS]: [
    'abastecimiento.ver', 'abastecimiento.crear', 'abastecimiento.editar',
    'abastecimiento.cambiar_estado', 'abastecimiento.autorizar', 'abastecimiento.anular',
    'catalogo.ver', 'catalogo.crear', 'catalogo.editar',
  ],
  [NOMBRE_ROL.PRODUCCION]: [
    'produccion.ver', 'produccion.crear', 'produccion.editar', 'produccion.cambiar_estado',
    'catalogo.ver',
    'pedidos.ver',
    'pqrs.ver', 'pqrs.crear',
  ],
  [NOMBRE_ROL.DESPACHO]: [
    'despacho.ver', 'despacho.crear', 'despacho.editar',
    'despacho.cambiar_estado', 'despacho.autorizar', 'despacho.anular',
    'pedidos.ver', 'pedidos.cambiar_estado',
    'catalogo.ver',
    'pqrs.ver',
  ],
};

/** Estados del sistema por módulo */
const datosEstados: {
  modulo: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  esEstadoInicial: boolean;
  esEstadoFinal: boolean;
}[] = [
  // ── Pedido ──────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'borrador',           nombre: 'Borrador',             descripcion: 'Pedido en construcción, no enviado a revisión',       esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'en_revision',        nombre: 'En revisión',          descripcion: 'Pendiente de validación por coordinador',             esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'validado',           nombre: 'Validado',             descripcion: 'Aprobado y listo para entrar a cola de producción',   esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'en_produccion',      nombre: 'En producción',        descripcion: 'Al menos una orden activa en planta',                 esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'listo_despacho',     nombre: 'Listo para despacho',  descripcion: 'Producción completa, pendiente de despacho',          esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'despachado',         nombre: 'Despachado',           descripcion: 'Pedido entregado parcial o totalmente al cliente',    esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'completado',         nombre: 'Completado',           descripcion: 'Entrega total confirmada, ciclo cerrado',             esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'cancelado',          nombre: 'Cancelado',            descripcion: 'Pedido anulado por administrador o gerencia',         esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.PEDIDO, codigo: 'bloqueado_anulacion',nombre: 'Bloqueado por anulación', descripcion: 'Factura anulada en ContaPyme — requiere revisión', esEstadoInicial: false, esEstadoFinal: false },

  // ── Orden de producción ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'creada',       nombre: 'Creada',          descripcion: 'Orden registrada, pendiente de validación',          esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'validada',     nombre: 'Validada',        descripcion: 'Orden aprobada, lista para entrar a cola',           esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'en_cola',      nombre: 'En cola',         descripcion: 'Esperando turno según prioridad de producción',      esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'en_corte',     nombre: 'En corte',        descripcion: 'Piezas en proceso de corte CNC',                     esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'corte_terminado', nombre: 'Corte terminado', descripcion: 'Corte finalizado, pendiente de siguiente etapa', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'en_enchape',   nombre: 'En enchape',      descripcion: 'Piezas en proceso de enchape o tapacanto',           esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'terminada',    nombre: 'Terminada',       descripcion: 'Todas las etapas completadas satisfactoriamente',    esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'en_reproceso', nombre: 'En reproceso',    descripcion: 'Orden devuelta por novedad que requiere rehacer',    esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, codigo: 'cancelada',    nombre: 'Cancelada',       descripcion: 'Orden cancelada; si inició producción usar cálculo de pérdidas', esEstadoInicial: false, esEstadoFinal: true },

  // ── Suborden ────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'creada',       nombre: 'Creada',       descripcion: 'Suborden registrada, pendiente de validación',        esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'validada',     nombre: 'Validada',     descripcion: 'Suborden aprobada, lista para entrar a cola',         esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'en_cola',      nombre: 'En cola',      descripcion: 'Esperando asignación de operario o turno',            esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'en_proceso',   nombre: 'En proceso',   descripcion: 'Trabajo en ejecución (perforación, entamborado, etc.)', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'terminada',    nombre: 'Terminada',    descripcion: 'Servicio o proceso completado',                       esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'en_reproceso', nombre: 'En reproceso', descripcion: 'Suborden devuelta por novedad',                       esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SUBORDEN, codigo: 'cancelada',    nombre: 'Cancelada',    descripcion: 'Suborden anulada por coordinador o administrador',    esEstadoInicial: false, esEstadoFinal: true  },

  // ── Etapa de producción ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, codigo: 'pendiente',  nombre: 'Pendiente',  descripcion: 'Etapa aún no iniciada',                      esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, codigo: 'en_proceso', nombre: 'En proceso', descripcion: 'Operario trabajando en esta etapa',          esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, codigo: 'pausada',    nombre: 'Pausada',    descripcion: 'Detenida temporalmente por novedad o turno', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, codigo: 'terminada',  nombre: 'Terminada',  descripcion: 'Etapa completada satisfactoriamente',        esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, codigo: 'cancelada',  nombre: 'Cancelada',  descripcion: 'Etapa cancelada antes de iniciar',           esEstadoInicial: false, esEstadoFinal: true  },

  // ── Despacho ────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'pendiente',  nombre: 'Pendiente',          descripcion: 'Despacho registrado, pendiente de autorización',   esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'autorizado', nombre: 'Autorizado',         descripcion: 'Autorizado para cargar y despachar',               esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'en_cargue',  nombre: 'En cargue',          descripcion: 'Material siendo cargado en el vehículo',           esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'despachado', nombre: 'Despachado',         descripcion: 'Material salió físicamente de la sede',            esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'entregado',  nombre: 'Entregado',          descripcion: 'Entregado y confirmado por el cliente',            esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'rechazado',  nombre: 'Rechazado',          descripcion: 'Rechazado por el cliente o en revisión',           esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.DESPACHO, codigo: 'cancelado',  nombre: 'Cancelado',          descripcion: 'Despacho cancelado antes de ejecutarse',           esEstadoInicial: false, esEstadoFinal: true  },

  // ── PQRS ────────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.PQRS, codigo: 'abierta',           nombre: 'Abierta',            descripcion: 'PQRS registrado, pendiente de atención',           esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PQRS, codigo: 'en_revision',       nombre: 'En revisión',        descripcion: 'Asignado a responsable, en análisis',              esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PQRS, codigo: 'en_solucion',       nombre: 'En solución',        descripcion: 'Ejecutando la solución acordada',                  esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PQRS, codigo: 'solucion_aplicada', nombre: 'Solución aplicada',  descripcion: 'Solución ejecutada, pendiente de cierre formal',   esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.PQRS, codigo: 'cerrada',           nombre: 'Cerrada',            descripcion: 'PQRS resuelto y cerrado formalmente',              esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.PQRS, codigo: 'anulada',           nombre: 'Anulada',            descripcion: 'PQRS sin base o duplicado, anulado por autorizado', esEstadoInicial: false, esEstadoFinal: true  },

  // ── Solicitud de compra ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, codigo: 'borrador',    nombre: 'Borrador',    descripcion: 'Solicitud en construcción',                      esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, codigo: 'en_revision', nombre: 'En revisión', descripcion: 'Enviada a aprobación de administrador',          esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, codigo: 'aprobada',    nombre: 'Aprobada',    descripcion: 'Aprobada, lista para generar orden de compra',   esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, codigo: 'rechazada',   nombre: 'Rechazada',   descripcion: 'No aprobada por administrador o gerencia',       esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, codigo: 'cancelada',   nombre: 'Cancelada',   descripcion: 'Solicitud cancelada antes de aprobación',       esEstadoInicial: false, esEstadoFinal: true  },

  // ── Compra de material ──────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'borrador',    nombre: 'Borrador',     descripcion: 'Compra en construcción, no enviada al proveedor', esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'enviada',     nombre: 'Enviada',      descripcion: 'Orden enviada al proveedor, esperando confirmación', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'confirmada',  nombre: 'Confirmada',   descripcion: 'Proveedor confirmó disponibilidad y fecha',      esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'en_transito', nombre: 'En tránsito',  descripcion: 'Material despachado por el proveedor',           esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'completada',  nombre: 'Completada',   descripcion: 'Material recibido y verificado en bodega',       esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, codigo: 'cancelada',   nombre: 'Cancelada',    descripcion: 'Compra cancelada antes o durante el proceso',    esEstadoInicial: false, esEstadoFinal: true  },

  // ── Recepción de material ───────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, codigo: 'pendiente',    nombre: 'Pendiente',    descripcion: 'Recepción registrada, material no llegó aún',   esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, codigo: 'en_proceso',   nombre: 'En proceso',   descripcion: 'Material llegó, verificando cantidades y estado', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, codigo: 'completada',   nombre: 'Completada',   descripcion: 'Recepción verificada y registrada en inventario', esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, codigo: 'con_novedad',  nombre: 'Con novedad',  descripcion: 'Recibido con diferencias, daños o faltantes',   esEstadoInicial: false, esEstadoFinal: true  },

  // ── Traslado de material ────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, codigo: 'borrador',    nombre: 'Borrador',     descripcion: 'Traslado en construcción',                        esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, codigo: 'en_transito', nombre: 'En tránsito',  descripcion: 'Material en camino hacia la sede destino',        esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, codigo: 'recibido',    nombre: 'Recibido',     descripcion: 'Confirmado y registrado en sede destino',         esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, codigo: 'cancelado',   nombre: 'Cancelado',    descripcion: 'Traslado cancelado antes de ejecutarse',          esEstadoInicial: false, esEstadoFinal: true  },

  // ── Requerimiento de material ───────────────────────────────────────────────
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'pendiente',    nombre: 'Pendiente',    descripcion: 'Requerimiento generado, pendiente de revisión', esEstadoInicial: true,  esEstadoFinal: false },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'en_revision',  nombre: 'En revisión',  descripcion: 'En evaluación por el área de compras',         esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'aprobado',     nombre: 'Aprobado',     descripcion: 'Aprobado para generar solicitud de compra o traslado', esEstadoInicial: false, esEstadoFinal: false },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'atendido',     nombre: 'Atendido',     descripcion: 'Material despachado o asignado al proceso',    esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'rechazado',    nombre: 'Rechazado',    descripcion: 'No aprobado; solicitante debe ajustar',        esEstadoInicial: false, esEstadoFinal: true  },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, codigo: 'cancelado',    nombre: 'Cancelado',    descripcion: 'Requerimiento cancelado por el solicitante',   esEstadoInicial: false, esEstadoFinal: true  },
];

/**
 * Transiciones de estado.
 * Formato: { modulo, origen, destino, requiereAutorizacion, nombre, rolesAutorizados }
 * Los rolesAutorizados solo aplican cuando requiereAutorizacion = true,
 * pero se asignan en transiciones_roles_autorizados para todas las transiciones
 * que definen quién puede ejecutarla.
 */
const datosTransiciones: {
  modulo: string;
  origen: string;
  destino: string;
  requiereAutorizacion: boolean;
  nombre: string;
  roles: string[];
}[] = [
  // ── Pedido ──────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'borrador',        destino: 'en_revision',        requiereAutorizacion: false, nombre: 'Enviar a revisión',       roles: [NOMBRE_ROL.VENDEDOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'en_revision',     destino: 'borrador',           requiereAutorizacion: false, nombre: 'Devolver a borrador',      roles: [NOMBRE_ROL.VENDEDOR, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'en_revision',     destino: 'validado',           requiereAutorizacion: true,  nombre: 'Validar pedido',           roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'validado',        destino: 'en_produccion',      requiereAutorizacion: false, nombre: 'Iniciar producción',        roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'en_produccion',   destino: 'listo_despacho',     requiereAutorizacion: false, nombre: 'Marcar listo para despacho', roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'listo_despacho',  destino: 'despachado',         requiereAutorizacion: false, nombre: 'Registrar despacho',        roles: [NOMBRE_ROL.DESPACHO, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'despachado',      destino: 'completado',         requiereAutorizacion: false, nombre: 'Confirmar entrega completa', roles: [NOMBRE_ROL.DESPACHO, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'en_revision',     destino: 'cancelado',          requiereAutorizacion: true,  nombre: 'Cancelar pedido en revisión', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'validado',        destino: 'cancelado',          requiereAutorizacion: true,  nombre: 'Cancelar pedido validado',  roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'en_revision',     destino: 'bloqueado_anulacion', requiereAutorizacion: true, nombre: 'Bloquear por anulación',   roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'bloqueado_anulacion', destino: 'cancelado',      requiereAutorizacion: true,  nombre: 'Cancelar pedido bloqueado', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PEDIDO, origen: 'bloqueado_anulacion', destino: 'en_revision',    requiereAutorizacion: true,  nombre: 'Reactivar desde bloqueo',  roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── Orden de producción ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'creada',        destino: 'validada',      requiereAutorizacion: true,  nombre: 'Validar orden',            roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'validada',      destino: 'en_cola',       requiereAutorizacion: false, nombre: 'Poner en cola',            roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'en_cola',       destino: 'en_corte',      requiereAutorizacion: false, nombre: 'Iniciar corte',            roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'en_corte',      destino: 'corte_terminado', requiereAutorizacion: false, nombre: 'Finalizar corte',       roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'corte_terminado', destino: 'en_enchape',  requiereAutorizacion: false, nombre: 'Iniciar enchape',         roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'en_enchape',    destino: 'terminada',     requiereAutorizacion: false, nombre: 'Finalizar orden',          roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'corte_terminado', destino: 'terminada',   requiereAutorizacion: false, nombre: 'Finalizar sin enchape',    roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'terminada',     destino: 'en_reproceso',  requiereAutorizacion: true,  nombre: 'Enviar a reproceso',       roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'en_reproceso',  destino: 'terminada',     requiereAutorizacion: false, nombre: 'Finalizar reproceso',      roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'creada',        destino: 'cancelada',     requiereAutorizacion: true,  nombre: 'Cancelar orden sin iniciar', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.ORDEN_PRODUCCION, origen: 'validada',      destino: 'cancelada',     requiereAutorizacion: true,  nombre: 'Cancelar orden validada',  roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── Suborden ────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'creada',    destino: 'validada',     requiereAutorizacion: true,  nombre: 'Validar suborden',          roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'validada',  destino: 'en_cola',      requiereAutorizacion: false, nombre: 'Poner en cola',             roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'en_cola',   destino: 'en_proceso',   requiereAutorizacion: false, nombre: 'Iniciar proceso',           roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'en_proceso', destino: 'terminada',   requiereAutorizacion: false, nombre: 'Finalizar suborden',        roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'en_proceso', destino: 'en_reproceso', requiereAutorizacion: true, nombre: 'Enviar a reproceso',        roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'en_reproceso', destino: 'terminada', requiereAutorizacion: false, nombre: 'Finalizar reproceso',       roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.SUBORDEN, origen: 'creada',    destino: 'cancelada',    requiereAutorizacion: true,  nombre: 'Cancelar suborden',         roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── Etapa de producción ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'pendiente',  destino: 'en_proceso', requiereAutorizacion: false, nombre: 'Iniciar etapa',            roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'en_proceso', destino: 'pausada',    requiereAutorizacion: false, nombre: 'Pausar etapa',             roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'pausada',    destino: 'en_proceso', requiereAutorizacion: false, nombre: 'Reanudar etapa',           roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'en_proceso', destino: 'terminada',  requiereAutorizacion: false, nombre: 'Finalizar etapa',          roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'terminada',  destino: 'en_proceso', requiereAutorizacion: true,  nombre: 'Reabrir etapa terminada',  roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.ETAPA_PRODUCCION, origen: 'pendiente',  destino: 'cancelada',  requiereAutorizacion: true,  nombre: 'Cancelar etapa',           roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },

  // ── Despacho ────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'pendiente',  destino: 'autorizado', requiereAutorizacion: true,  nombre: 'Autorizar despacho',        roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'autorizado', destino: 'en_cargue',  requiereAutorizacion: false, nombre: 'Iniciar cargue',            roles: [NOMBRE_ROL.DESPACHO] },
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'en_cargue',  destino: 'despachado', requiereAutorizacion: false, nombre: 'Registrar despacho',        roles: [NOMBRE_ROL.DESPACHO] },
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'despachado', destino: 'entregado',  requiereAutorizacion: false, nombre: 'Confirmar entrega',         roles: [NOMBRE_ROL.DESPACHO, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'autorizado', destino: 'rechazado',  requiereAutorizacion: true,  nombre: 'Rechazar despacho',         roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.DESPACHO, origen: 'pendiente',  destino: 'cancelado',  requiereAutorizacion: true,  nombre: 'Cancelar despacho',         roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── PQRS ────────────────────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.PQRS, origen: 'abierta',           destino: 'en_revision',       requiereAutorizacion: false, nombre: 'Iniciar revisión',           roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'en_revision',       destino: 'en_solucion',       requiereAutorizacion: false, nombre: 'Pasar a solución',           roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'en_solucion',       destino: 'solucion_aplicada', requiereAutorizacion: false, nombre: 'Registrar solución aplicada', roles: [NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'solucion_aplicada', destino: 'cerrada',           requiereAutorizacion: true,  nombre: 'Cerrar PQRS',                roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'solucion_aplicada', destino: 'en_revision',       requiereAutorizacion: false, nombre: 'Devolver a revisión',        roles: [NOMBRE_ROL.COORDINADOR, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'en_revision',       destino: 'anulada',           requiereAutorizacion: true,  nombre: 'Anular PQRS',                roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.PQRS, origen: 'abierta',           destino: 'anulada',           requiereAutorizacion: true,  nombre: 'Anular PQRS nuevo',          roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── Solicitud de compra ─────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, origen: 'borrador',    destino: 'en_revision', requiereAutorizacion: false, nombre: 'Enviar a revisión',   roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, origen: 'en_revision', destino: 'aprobada',    requiereAutorizacion: true,  nombre: 'Aprobar solicitud',   roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, origen: 'en_revision', destino: 'rechazada',   requiereAutorizacion: true,  nombre: 'Rechazar solicitud',  roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.SOLICITUD_COMPRA, origen: 'borrador',    destino: 'cancelada',   requiereAutorizacion: false, nombre: 'Cancelar solicitud',  roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },

  // ── Compra de material ──────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'borrador',    destino: 'enviada',     requiereAutorizacion: false, nombre: 'Enviar al proveedor', roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'enviada',     destino: 'confirmada',  requiereAutorizacion: false, nombre: 'Confirmar compra',   roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'confirmada',  destino: 'en_transito', requiereAutorizacion: false, nombre: 'Marcar en tránsito', roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'en_transito', destino: 'completada',  requiereAutorizacion: false, nombre: 'Registrar recepción', roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'borrador',    destino: 'cancelada',   requiereAutorizacion: true,  nombre: 'Cancelar compra',    roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },
  { modulo: MODULO_ESTADO.COMPRA_MATERIAL, origen: 'enviada',     destino: 'cancelada',   requiereAutorizacion: true,  nombre: 'Cancelar compra enviada', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },

  // ── Recepción de material ───────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, origen: 'pendiente',  destino: 'en_proceso',  requiereAutorizacion: false, nombre: 'Iniciar recepción',  roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.PRODUCCION] },
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, origen: 'en_proceso', destino: 'completada',  requiereAutorizacion: false, nombre: 'Completar recepción', roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.RECEPCION_MATERIAL, origen: 'en_proceso', destino: 'con_novedad', requiereAutorizacion: false, nombre: 'Registrar novedad',  roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },

  // ── Traslado de material ────────────────────────────────────────────────────
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, origen: 'borrador',    destino: 'en_transito', requiereAutorizacion: false, nombre: 'Despachar traslado',  roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, origen: 'en_transito', destino: 'recibido',    requiereAutorizacion: false, nombre: 'Confirmar recepción', roles: [NOMBRE_ROL.PRODUCCION, NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.TRASLADO_MATERIAL, origen: 'borrador',    destino: 'cancelado',   requiereAutorizacion: false, nombre: 'Cancelar traslado',   roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },

  // ── Requerimiento de material ───────────────────────────────────────────────
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, origen: 'pendiente',   destino: 'en_revision', requiereAutorizacion: false, nombre: 'Enviar a revisión',  roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.COORDINADOR] },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, origen: 'en_revision', destino: 'aprobado',    requiereAutorizacion: true,  nombre: 'Aprobar requerimiento', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, origen: 'aprobado',    destino: 'atendido',    requiereAutorizacion: false, nombre: 'Marcar atendido',    roles: [NOMBRE_ROL.COMPRAS] },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, origen: 'en_revision', destino: 'rechazado',   requiereAutorizacion: true,  nombre: 'Rechazar requerimiento', roles: [NOMBRE_ROL.ADMIN_PUNTO, NOMBRE_ROL.GERENTE] },
  { modulo: MODULO_ESTADO.REQUERIMIENTO_MATERIAL, origen: 'pendiente',   destino: 'cancelado',   requiereAutorizacion: false, nombre: 'Cancelar requerimiento', roles: [NOMBRE_ROL.COMPRAS, NOMBRE_ROL.ADMIN_PUNTO] },
];

const datosTiposItem = [
  { nombre: 'Madera',   comportamiento: ComportamientoTipoItem.MATERIA_PRIMA, descripcion: 'Tableros y paneles melamínicos; materia prima principal' },
  { nombre: 'Herraje',  comportamiento: ComportamientoTipoItem.PRODUCTO,      descripcion: 'Bisagras, correderas, jaladeras y accesorios de carpintería' },
  { nombre: 'Servicio', comportamiento: ComportamientoTipoItem.SERVICIO,      descripcion: 'Procesos adicionales: perforación, reengrueso, entamborado, armado' },
  { nombre: 'Insumo',   comportamiento: ComportamientoTipoItem.INSUMO,        descripcion: 'Pegante, tornillos, tapas y materiales auxiliares de producción' },
];

const datosTiposDocumento = [
  { nombre: 'Factura',       codigo: 'FACTURA',     descripcion: 'Factura comercial del cliente',                    requiereVersionamiento: true  },
  { nombre: 'Plano de corte', codigo: 'PLANO_CORTE', descripcion: 'Archivo CutList con distribución de piezas',       requiereVersionamiento: true  },
  { nombre: 'Nota crédito',  codigo: 'NOTA_CREDITO', descripcion: 'Nota crédito o devolución asociada a una factura', requiereVersionamiento: false },
  { nombre: 'Remisión',      codigo: 'REMISION',    descripcion: 'Documento de entrega sin cobro inmediato',          requiereVersionamiento: false },
  { nombre: 'Soporte',       codigo: 'SOPORTE',     descripcion: 'Foto, certificado u otro soporte operativo',        requiereVersionamiento: false },
];

const datosTiposNovedad = [
  { nombre: 'Daño de material',   aplicaA: AplicaNovedadA.MATERIAL,          descripcion: 'Tablero, panel o insumo dañado durante el proceso' },
  { nombre: 'Error de corte',     aplicaA: AplicaNovedadA.ORDEN_PRODUCCION,   descripcion: 'Pieza cortada con medidas incorrectas o fuera de tolerancia' },
  { nombre: 'Error de enchape',   aplicaA: AplicaNovedadA.ORDEN_PRODUCCION,   descripcion: 'Falla en aplicación de tapacanto o enchape' },
  { nombre: 'Falta de material',  aplicaA: AplicaNovedadA.MATERIAL,          descripcion: 'Material insuficiente o faltante para completar la orden' },
  { nombre: 'Falla de máquina',   aplicaA: AplicaNovedadA.ORDEN_PRODUCCION,   descripcion: 'Equipo CNC u otra máquina presenta falla técnica' },
  { nombre: 'Cambio de prioridad', aplicaA: AplicaNovedadA.GENERAL,           descripcion: 'Ajuste de urgencia o secuencia de producción por solicitud' },
  { nombre: 'PQRS de cliente',    aplicaA: AplicaNovedadA.GENERAL,            descripcion: 'Reclamación, queja o solicitud formal del cliente' },
  { nombre: 'General',            aplicaA: AplicaNovedadA.GENERAL,            descripcion: 'Novedad operativa sin categoría específica' },
];

const datosEtapasProduccion = [
  { nombre: 'Corte',           codigo: 'CORTE',          orden: 1, descripcion: 'Corte CNC de tableros según plano CutList' },
  { nombre: 'Enchape',         codigo: 'ENCHAPE',        orden: 2, descripcion: 'Aplicación de tapacanto en cantos de las piezas' },
  { nombre: 'Perforación',     codigo: 'PERFORACION',    orden: 3, descripcion: 'Perforaciones para bisagras, correderas y herrajes' },
  { nombre: 'Reengrueso',      codigo: 'REENGRUESO',     orden: 4, descripcion: 'Incremento de espesor mediante unión de tableros' },
  { nombre: 'Entamborado',     codigo: 'ENTAMBORADO',   orden: 5, descripcion: 'Construcción de estructuras tipo tambo o caja' },
  { nombre: 'Armado',          codigo: 'ARMADO',         orden: 6, descripcion: 'Ensamble de puertas, marcos y estructuras finales' },
  { nombre: 'Control de calidad', codigo: 'CONTROL_CALIDAD', orden: 7, descripcion: 'Revisión final de medidas, acabados y herrajes' },
];

const datosTiposValidacionDespacho = [
  { codigo: 'PIEZAS_COMPLETAS',    nombre: 'Piezas completas',       descripcion: 'Verificar que todas las piezas del pedido estén presentes',          ordenVisual: 1 },
  { codigo: 'MEDIDAS_VERIFICADAS', nombre: 'Medidas verificadas',    descripcion: 'Confirmar que las medidas coincidan con el pedido',                   ordenVisual: 2 },
  { codigo: 'CANTOS_VERIFICADOS',  nombre: 'Cantos verificados',     descripcion: 'Revisar que el enchape y tapacanto estén aplicados correctamente',     ordenVisual: 3 },
  { codigo: 'HERRAJES_COMPLETOS',  nombre: 'Herrajes completos',     descripcion: 'Verificar que todos los herrajes del pedido están incluidos',          ordenVisual: 4 },
  { codigo: 'EVIDENCIA_FOTOGRAFICA', nombre: 'Evidencia fotográfica', descripcion: 'Tomar foto del material listo para despacho',                         ordenVisual: 5 },
  { codigo: 'FIRMA_CLIENTE',       nombre: 'Firma del cliente',      descripcion: 'Obtener firma del cliente o persona autorizada al recibir el pedido',  ordenVisual: 6 },
];

// =============================================================================
// FUNCIONES DE SEED
// =============================================================================

async function seedSedes(): Promise<void> {
  console.log('  Creando sedes...');
  for (const sede of datosSedes) {
    await prisma.sede.upsert({
      where: { nombre: sede.nombre },
      update: { codigo: sede.codigo, direccion: sede.direccion },
      create: { nombre: sede.nombre, codigo: sede.codigo, direccion: sede.direccion },
    });
  }
}

async function seedRoles(): Promise<void> {
  console.log('  Creando roles...');
  for (const rol of datosRoles) {
    await prisma.rol.upsert({
      where:  { nombre: rol.nombre },
      update: { descripcion: rol.descripcion },
      create: { nombre: rol.nombre, descripcion: rol.descripcion },
    });
  }
}

async function seedPermisos(): Promise<void> {
  console.log('  Creando permisos...');
  for (const modulo of MODULO_PERMISO) {
    for (const accion of ACCION_PERMISO) {
      const codigo = `${modulo}.${accion}`;
      await prisma.permiso.upsert({
        where:  { codigo },
        update: { modulo, descripcion: `${accion} en módulo ${modulo}` },
        create: { codigo, modulo, descripcion: `${accion} en módulo ${modulo}` },
      });
    }
  }
}

async function seedRolesPermisos(): Promise<void> {
  console.log('  Asignando permisos a roles...');

  // Gerente y admin_punto reciben todos los permisos
  const todosLosPermisos = MODULO_PERMISO.flatMap(m =>
    ACCION_PERMISO.map(a => `${m}.${a}`),
  );
  permisosPorRol[NOMBRE_ROL.GERENTE]     = todosLosPermisos;
  permisosPorRol[NOMBRE_ROL.ADMIN_PUNTO] = todosLosPermisos;

  for (const [nombreRol, codigosPermiso] of Object.entries(permisosPorRol)) {
    const rol = await prisma.rol.findUniqueOrThrow({ where: { nombre: nombreRol } });

    for (const codigoPermiso of codigosPermiso) {
      const permiso = await prisma.permiso.findUniqueOrThrow({ where: { codigo: codigoPermiso } });

      await prisma.rolPermiso.upsert({
        where:  { rolId_permisoId: { rolId: rol.id, permisoId: permiso.id } },
        update: {},
        create: { rolId: rol.id, permisoId: permiso.id },
      });
    }
  }
}

async function seedEstadosSistema(): Promise<void> {
  console.log('  Creando estados del sistema...');
  for (const estado of datosEstados) {
    await prisma.estadoSistema.upsert({
      where:  { modulo_codigo: { modulo: estado.modulo, codigo: estado.codigo } },
      update: {
        nombre:          estado.nombre,
        descripcion:     estado.descripcion,
        esEstadoInicial: estado.esEstadoInicial,
        esEstadoFinal:   estado.esEstadoFinal,
      },
      create: {
        modulo:          estado.modulo,
        codigo:          estado.codigo,
        nombre:          estado.nombre,
        descripcion:     estado.descripcion,
        esEstadoInicial: estado.esEstadoInicial,
        esEstadoFinal:   estado.esEstadoFinal,
      },
    });
  }
}

async function seedTransiciones(): Promise<void> {
  console.log('  Creando transiciones de estado...');

  // Cargar todos los estados en un mapa para evitar N+1
  const estados = await prisma.estadoSistema.findMany();
  const mapaEstados = new Map<string, string>();
  for (const estado of estados) {
    mapaEstados.set(`${estado.modulo}.${estado.codigo}`, estado.id);
  }

  for (const t of datosTransiciones) {
    const origenId  = mapaEstados.get(`${t.modulo}.${t.origen}`);
    const destinoId = mapaEstados.get(`${t.modulo}.${t.destino}`);

    if (!origenId || !destinoId) {
      console.warn(`    ADVERTENCIA: estado no encontrado para transición ${t.modulo}: ${t.origen} → ${t.destino}`);
      continue;
    }

    const transicion = await prisma.transicionEstado.upsert({
      where: {
        estadoOrigenId_estadoDestinoId: {
          estadoOrigenId:  origenId,
          estadoDestinoId: destinoId,
        },
      },
      update: {
        nombre:               t.nombre,
        requiereAutorizacion: t.requiereAutorizacion,
      },
      create: {
        estadoOrigenId:       origenId,
        estadoDestinoId:      destinoId,
        nombre:               t.nombre,
        requiereAutorizacion: t.requiereAutorizacion,
      },
    });

    // Asignar roles autorizados para esta transición
    for (const nombreRol of t.roles) {
      const rol = await prisma.rol.findUniqueOrThrow({ where: { nombre: nombreRol } });

      await prisma.transicionRolAutorizado.upsert({
        where: {
          transicionId_rolId: { transicionId: transicion.id, rolId: rol.id },
        },
        update: {},
        create: { transicionId: transicion.id, rolId: rol.id },
      });
    }
  }
}

async function seedUsuarioAdmin(): Promise<void> {
  console.log('  Creando usuario administrador...');

  const sedeAdmin = await prisma.sede.findUniqueOrThrow({ where: { codigo: CODIGO_SEDE.CR9 } });
  const rolGerente = await prisma.rol.findUniqueOrThrow({ where: { nombre: NOMBRE_ROL.GERENTE } });

  // ADVERTENCIA DE SEGURIDAD: contraseña temporal. Cambiar antes de pasar a producción.
  const passwordHash = await bcrypt.hash('Admin123*', SALT_ROUNDS);

  await prisma.usuario.upsert({
    where:  { email: 'admin@lamicenter.local' },
    update: { nombre: 'Administrador Lamicenter', rolId: rolGerente.id, sedeId: sedeAdmin.id },
    create: {
      nombre:       'Administrador Lamicenter',
      email:        'admin@lamicenter.local',
      passwordHash,
      sedeId:       sedeAdmin.id,
      rolId:        rolGerente.id,
    },
  });
}

async function seedTiposItem(): Promise<void> {
  console.log('  Creando tipos de ítem...');
  for (const tipo of datosTiposItem) {
    await prisma.tipoItem.upsert({
      where:  { nombre: tipo.nombre },
      update: { comportamiento: tipo.comportamiento, descripcion: tipo.descripcion },
      create: { nombre: tipo.nombre, comportamiento: tipo.comportamiento, descripcion: tipo.descripcion },
    });
  }
}

async function seedTiposDocumento(): Promise<void> {
  console.log('  Creando tipos de documento...');
  for (const tipo of datosTiposDocumento) {
    await prisma.tipoDocumento.upsert({
      where:  { codigo: tipo.codigo },
      update: { nombre: tipo.nombre, descripcion: tipo.descripcion, requiereVersionamiento: tipo.requiereVersionamiento },
      create: { nombre: tipo.nombre, codigo: tipo.codigo, descripcion: tipo.descripcion, requiereVersionamiento: tipo.requiereVersionamiento },
    });
  }
}

async function seedTiposNovedad(): Promise<void> {
  console.log('  Creando tipos de novedad...');
  for (const tipo of datosTiposNovedad) {
    await prisma.tipoNovedad.upsert({
      where:  { nombre: tipo.nombre },
      update: { aplicaA: tipo.aplicaA, descripcion: tipo.descripcion },
      create: { nombre: tipo.nombre, aplicaA: tipo.aplicaA, descripcion: tipo.descripcion },
    });
  }
}

async function seedEtapasProduccion(): Promise<void> {
  console.log('  Creando etapas de producción...');
  for (const etapa of datosEtapasProduccion) {
    await prisma.etapaProduccion.upsert({
      where:  { codigo: etapa.codigo },
      update: { nombre: etapa.nombre, orden: etapa.orden, descripcion: etapa.descripcion },
      create: { nombre: etapa.nombre, codigo: etapa.codigo, orden: etapa.orden, descripcion: etapa.descripcion },
    });
  }
}

async function seedTiposValidacionDespacho(): Promise<void> {
  console.log('  Creando tipos de validación de despacho...');
  for (const tipo of datosTiposValidacionDespacho) {
    await prisma.tipoValidacionDespacho.upsert({
      where:  { codigo: tipo.codigo },
      update: { nombre: tipo.nombre, descripcion: tipo.descripcion, ordenVisual: tipo.ordenVisual },
      create: { codigo: tipo.codigo, nombre: tipo.nombre, descripcion: tipo.descripcion, ordenVisual: tipo.ordenVisual },
    });
  }
}

// =============================================================================
// FUNCIÓN PRINCIPAL
// =============================================================================

async function main(): Promise<void> {
  console.log('Iniciando seed base Lamicenter...\n');

  await seedSedes();
  await seedRoles();
  await seedPermisos();
  await seedRolesPermisos();
  await seedEstadosSistema();
  await seedTransiciones();
  await seedUsuarioAdmin();
  await seedTiposItem();
  await seedTiposDocumento();
  await seedTiposNovedad();
  await seedEtapasProduccion();
  await seedTiposValidacionDespacho();

  console.log('\nSeed completado exitosamente.');
}

main()
  .catch((error: unknown) => {
    console.error('Error durante el seed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
