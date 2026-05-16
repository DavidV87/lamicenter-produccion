import { Controller, Get, Query } from '@nestjs/common';
import { ReportesServicio } from './reportes.servicio';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { RangoFechasQueryDto } from './dto/rango-fechas-query.dto';
import { Roles } from '../seguridad/auth/decorators/roles.decorador';
import { Permisos } from '../seguridad/auth/decorators/permisos.decorador';
import { respuestaExitosa } from '../../common/helpers/respuesta-api.helper';
import { RespuestaApi } from '../../common/interfaces/respuesta-api.interface';

/**
 * ReportesControlador — endpoints de consulta read-only.
 *
 * Todos los endpoints:
 *  - Requieren JWT válido (guard global JwtAuthGuarda)
 *  - No modifican datos
 *  - Calculan métricas en tiempo real desde PostgreSQL
 *
 * Permisos necesarios (deben estar sembrados en roles_permisos):
 *  - dashboard.ver → acceso a endpoints de dashboard
 *  - reportes.ver  → acceso a endpoints de reportes por módulo
 *  - auditoria.ver → acceso a actividad de auditoría (requiere también rol 'gerente')
 */
@Controller('reportes')
export class ReportesControlador {
  constructor(private readonly reportesServicio: ReportesServicio) {}

  // ===========================================================================
  // DASHBOARD
  // ===========================================================================

  /**
   * GET /reportes/dashboard/resumen-general
   * Métricas consolidadas de los 5 módulos principales en tiempo real.
   */
  @Get('dashboard/resumen-general')
  @Permisos('dashboard.ver')
  async resumenGeneral(
    @Query() query: DashboardQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resumen = await this.reportesServicio.resumenGeneral(query);
    return respuestaExitosa(resumen, 'Resumen general obtenido exitosamente');
  }

  /**
   * GET /reportes/dashboard/actividad-reciente
   * Top 20 actividades recientes mezcladas de pedidos, PQRS, despachos y producción.
   * Acepta ?sedeId y ?limite para ajustar el resultado.
   */
  @Get('dashboard/actividad-reciente')
  @Permisos('dashboard.ver')
  async actividadReciente(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const actividad = await this.reportesServicio.actividadReciente(
      { sedeId: query.sedeId },
      query.limite ?? 20,
    );
    return respuestaExitosa(actividad, 'Actividad reciente obtenida exitosamente');
  }

  // ===========================================================================
  // PEDIDOS
  // ===========================================================================

  /**
   * GET /reportes/pedidos/por-estado
   * Conteo de pedidos agrupado por estado. Soporta ?sedeId, ?fechaDesde, ?fechaHasta.
   */
  @Get('pedidos/por-estado')
  @Permisos('reportes.ver')
  async pedidosPorEstado(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.pedidosPorEstado(query);
    return respuestaExitosa(resultado, 'Pedidos por estado obtenidos exitosamente');
  }

  /**
   * GET /reportes/pedidos/por-sede
   * Conteo de pedidos agrupado por sede de venta.
   */
  @Get('pedidos/por-sede')
  @Permisos('reportes.ver')
  async pedidosPorSede(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.pedidosPorSede(query);
    return respuestaExitosa(resultado, 'Pedidos por sede obtenidos exitosamente');
  }

  /**
   * GET /reportes/pedidos/tiempos
   * Tiempos promedio del ciclo de vida del pedido calculados en PostgreSQL.
   * Excluye pedidos sin fecha de despacho completo.
   */
  @Get('pedidos/tiempos')
  @Permisos('reportes.ver')
  async tiemposPedido(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.tiemposPedido(query);
    return respuestaExitosa(resultado, 'Tiempos de pedido obtenidos exitosamente');
  }

  // ===========================================================================
  // PRODUCCIÓN
  // ===========================================================================

  /**
   * GET /reportes/produccion/por-estado
   * Conteo de órdenes de producción agrupadas por estado.
   */
  @Get('produccion/por-estado')
  @Permisos('reportes.ver')
  async produccionPorEstado(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.produccionPorEstado(query);
    return respuestaExitosa(resultado, 'Producción por estado obtenida exitosamente');
  }

  /**
   * GET /reportes/produccion/ordenes-activas
   * Listado de órdenes activas ordenadas por prioridad descendente.
   */
  @Get('produccion/ordenes-activas')
  @Permisos('reportes.ver')
  async ordenesActivas(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.ordenesActivas(query);
    return respuestaExitosa(resultado, 'Órdenes activas obtenidas exitosamente');
  }

  /**
   * GET /reportes/produccion/eventos-recientes
   * Eventos operativos recientes ordenados por fechaEvento descendente.
   */
  @Get('produccion/eventos-recientes')
  @Permisos('reportes.ver')
  async eventosRecientes(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.eventosRecientes(query);
    return respuestaExitosa(resultado, 'Eventos recientes obtenidos exitosamente');
  }

  // ===========================================================================
  // ABASTECIMIENTO
  // ===========================================================================

  /**
   * GET /reportes/abastecimiento/requerimientos-pendientes
   * Requerimientos en estados: pendiente, en_revision, aprobado.
   */
  @Get('abastecimiento/requerimientos-pendientes')
  @Permisos('reportes.ver')
  async requerimientosPendientes(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.requerimientosPendientes(query);
    return respuestaExitosa(resultado, 'Requerimientos pendientes obtenidos exitosamente');
  }

  /**
   * GET /reportes/abastecimiento/solicitudes-activas
   * Solicitudes de compra en estados: borrador, en_revision, aprobada.
   */
  @Get('abastecimiento/solicitudes-activas')
  @Permisos('reportes.ver')
  async solicitudesActivas(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.solicitudesActivas(query);
    return respuestaExitosa(resultado, 'Solicitudes activas obtenidas exitosamente');
  }

  // ===========================================================================
  // DESPACHO
  // ===========================================================================

  /**
   * GET /reportes/despacho/por-estado
   * Conteo de despachos agrupado por estado.
   */
  @Get('despacho/por-estado')
  @Permisos('reportes.ver')
  async despachoPorEstado(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.despachoPorEstado(query);
    return respuestaExitosa(resultado, 'Despachos por estado obtenidos exitosamente');
  }

  /**
   * GET /reportes/despacho/pendientes
   * Despachos en estados: pendiente, autorizado, en_cargue.
   * Ordenados por fechaDespacho ascendente (más urgentes primero).
   */
  @Get('despacho/pendientes')
  @Permisos('reportes.ver')
  async despachosPendientes(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.despachosPendientes(query);
    return respuestaExitosa(resultado, 'Despachos pendientes obtenidos exitosamente');
  }

  // ===========================================================================
  // PQRS
  // ===========================================================================

  /**
   * GET /reportes/pqrs/resumen
   * Métricas globales de PQRS: totales por estado + distribución por tipo.
   */
  @Get('pqrs/resumen')
  @Permisos('reportes.ver')
  async pqrsResumen(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.pqrsResumen(query);
    return respuestaExitosa(resultado, 'Resumen de PQRS obtenido exitosamente');
  }

  /**
   * GET /reportes/pqrs/abiertas
   * PQRS en estados no cerrados (abierta, en_revision, en_solucion, solucion_aplicada).
   * Incluye días abierta calculados en tiempo real.
   */
  @Get('pqrs/abiertas')
  @Permisos('reportes.ver')
  async pqrsAbiertas(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.pqrsAbiertas(query);
    return respuestaExitosa(resultado, 'PQRS abiertas obtenidas exitosamente');
  }

  /**
   * GET /reportes/pqrs/por-tipo
   * Distribución de PQRS agrupada por tipo de novedad.
   */
  @Get('pqrs/por-tipo')
  @Permisos('reportes.ver')
  async pqrsPorTipo(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.pqrsPorTipo(query);
    return respuestaExitosa(resultado, 'PQRS por tipo obtenidas exitosamente');
  }

  // ===========================================================================
  // AUDITORÍA
  // ===========================================================================

  /**
   * GET /reportes/auditoria/actividad-reciente
   * Actividad reciente del log de auditoría general.
   * Requiere rol 'gerente' Y permiso 'auditoria.ver'.
   * No expone datosAnteriores, datosNuevos ni metadata.
   */
  @Get('auditoria/actividad-reciente')
  @Roles('gerente')
  @Permisos('auditoria.ver')
  async auditoriaActividadReciente(
    @Query() query: RangoFechasQueryDto,
  ): Promise<RespuestaApi<unknown>> {
    const resultado = await this.reportesServicio.auditoriaActividadReciente(query);
    return respuestaExitosa(resultado, 'Actividad de auditoría obtenida exitosamente');
  }
}
