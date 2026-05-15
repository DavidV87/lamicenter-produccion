import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria, TipoEvidenciaPqrs } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { MotorEstadosServicio } from '../../common/motor-estados/motor-estados.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { CrearPqrsDto } from './dto/crear-pqrs.dto';
import { ListarPqrsQueryDto } from './dto/listar-pqrs-query.dto';
import { CambiarEstadoPqrsDto } from './dto/cambiar-estado-pqrs.dto';
import { CrearSeguimientoPqrsDto } from './dto/crear-seguimiento-pqrs.dto';
import { CrearEvidenciaPqrsDto } from './dto/crear-evidencia-pqrs.dto';
import { AsignarResponsablePqrsDto } from './dto/asignar-responsable-pqrs.dto';
import {
  CrearPqrsRespuesta,
  EvidenciaPqrsResumen,
  ListaPaginadaPqrs,
  PqrsDetalle,
  PqrsResumen,
  ResponsablePqrsResumen,
  SeguimientoPqrsResumen,
} from './interfaces/pqrs.interfaces';

@Injectable()
export class PqrsServicio {
  constructor(
    private readonly prisma: PrismaServicio,
    private readonly motorEstados: MotorEstadosServicio,
  ) {}

  // ===========================================================================
  // CREAR PQRS
  // ===========================================================================

  async crearPqrs(dto: CrearPqrsDto, usuario: UsuarioJwt): Promise<CrearPqrsRespuesta> {
    // Validar cliente activo
    const cliente = await this.prisma.cliente.findUnique({
      where: { id: dto.clienteId },
      select: { id: true, activo: true, razonSocial: true },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${dto.clienteId} no encontrado`);
    if (!cliente.activo) throw new BadRequestException(`El cliente no está activo`);

    // Validar tipoNovedad activo
    const tipoNovedad = await this.prisma.tipoNovedad.findUnique({
      where: { id: dto.tipoNovedadId },
      select: { id: true, activo: true },
    });
    if (!tipoNovedad) throw new NotFoundException(`TipoNovedad ${dto.tipoNovedadId} no encontrado`);
    if (!tipoNovedad.activo) throw new BadRequestException(`El tipo de novedad no está activo`);

    // Validar regla generaReproceso
    if (dto.generaReproceso && !dto.novedadOperativaId && !dto.reprocesoId) {
      throw new BadRequestException(
        'Cuando generaReproceso=true se debe indicar novedadOperativaId o reprocesoId',
      );
    }

    // Validar FKs opcionales si vienen
    if (dto.pedidoId) {
      const existe = await this.prisma.pedido.findUnique({ where: { id: dto.pedidoId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Pedido ${dto.pedidoId} no encontrado`);
    }
    if (dto.facturaId) {
      const existe = await this.prisma.factura.findUnique({ where: { id: dto.facturaId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Factura ${dto.facturaId} no encontrada`);
    }
    if (dto.ordenProduccionId) {
      const existe = await this.prisma.ordenProduccion.findUnique({ where: { id: dto.ordenProduccionId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`OrdenProduccion ${dto.ordenProduccionId} no encontrada`);
    }
    if (dto.subordenId) {
      const existe = await this.prisma.suborden.findUnique({ where: { id: dto.subordenId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Suborden ${dto.subordenId} no encontrada`);
    }
    if (dto.pedidoItemId) {
      const existe = await this.prisma.pedidoItem.findUnique({ where: { id: dto.pedidoItemId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`PedidoItem ${dto.pedidoItemId} no encontrado`);
    }
    if (dto.responsableSolucionId) {
      const existe = await this.prisma.usuario.findUnique({ where: { id: dto.responsableSolucionId }, select: { id: true, activo: true } });
      if (!existe) throw new NotFoundException(`Usuario responsable ${dto.responsableSolucionId} no encontrado`);
      if (!existe.activo) throw new BadRequestException(`El usuario responsable no está activo`);
    }
    if (dto.novedadOperativaId) {
      const existe = await this.prisma.novedadOperativa.findUnique({ where: { id: dto.novedadOperativaId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`NovedadOperativa ${dto.novedadOperativaId} no encontrada`);
    }
    if (dto.reprocesoId) {
      const existe = await this.prisma.reproceso.findUnique({ where: { id: dto.reprocesoId }, select: { id: true } });
      if (!existe) throw new NotFoundException(`Reproceso ${dto.reprocesoId} no encontrado`);
    }

    // Detectar PQRS abierta para mismo pedido o ítem — NO bloquea, genera advertencia
    const advertencias: string[] = [];
    if (dto.pedidoId || dto.pedidoItemId) {
      const estadosAbiertos = await this.prisma.estadoSistema.findMany({
        where: { modulo: 'pqrs', codigo: { in: ['abierta', 'en_revision', 'en_solucion'] } },
        select: { id: true },
      });
      const estadoIds = estadosAbiertos.map((e) => e.id);

      const condicionesOr: Prisma.PqrsWhereInput[] = [];
      if (dto.pedidoId) condicionesOr.push({ pedidoId: dto.pedidoId });
      if (dto.pedidoItemId) condicionesOr.push({ pedidoItemId: dto.pedidoItemId });

      const pqrsAbierta = await this.prisma.pqrs.findFirst({
        where: { estadoPqrsId: { in: estadoIds }, OR: condicionesOr },
        select: { id: true },
      });
      if (pqrsAbierta) {
        advertencias.push('Ya existe PQRS abierta para este pedido o ítem');
      }
    }

    // Obtener estado inicial del módulo 'pqrs'
    const estadoInicial = await this.prisma.estadoSistema.findFirst({
      where: { modulo: 'pqrs', esEstadoInicial: true },
      select: { id: true },
    });
    if (!estadoInicial) {
      throw new BadRequestException('No existe estado inicial configurado para el módulo pqrs');
    }

    // Generar consecutivo: PQRS-YYYYMMDD-XXXX
    const consecutivo = await this._generarConsecutivo();

    const pqrs = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nueva = await tx.pqrs.create({
        data: {
          consecutivo,
          clienteId:            dto.clienteId,
          pedidoId:             dto.pedidoId,
          facturaId:            dto.facturaId,
          ordenProduccionId:    dto.ordenProduccionId,
          subordenId:           dto.subordenId,
          pedidoItemId:         dto.pedidoItemId,
          tipoNovedadId:        dto.tipoNovedadId,
          estadoPqrsId:         estadoInicial.id,
          creadoPorUsuarioId:   usuario.sub,
          responsableSolucionId: dto.responsableSolucionId,
          generaReproceso:      dto.generaReproceso ?? false,
          novedadOperativaId:   dto.novedadOperativaId,
          reprocesoId:          dto.reprocesoId,
          costoEstimado:        dto.costoEstimado ? new Prisma.Decimal(dto.costoEstimado) : undefined,
          descripcion:          dto.descripcion,
          metadata:             dto.metadata as unknown as Prisma.InputJsonValue,
        },
      });

      // Seguimiento de creación
      await tx.pqrsSeguimiento.create({
        data: {
          pqrsId:            nueva.id,
          creadoPorUsuarioId: usuario.sub,
          tipoSeguimiento:   'CREACION',
          descripcion:       dto.descripcion,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'pqrs',
          registroId:    nueva.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { consecutivo, clienteId: dto.clienteId, descripcion: dto.descripcion } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nueva;
    });

    return { pqrs: await this.obtenerPqrs(pqrs.id), advertencias };
  }

  // ===========================================================================
  // LISTAR
  // ===========================================================================

  async listarPqrs(query: ListarPqrsQueryDto): Promise<ListaPaginadaPqrs> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const skip   = (pagina - 1) * limite;

    const where: Prisma.PqrsWhereInput = {};

    if (query.clienteId)      where.clienteId    = query.clienteId;
    if (query.estadoPqrsId)   where.estadoPqrsId = query.estadoPqrsId;
    if (query.tipoNovedadId)  where.tipoNovedadId = query.tipoNovedadId;
    if (query.pedidoId)       where.pedidoId     = query.pedidoId;
    if (query.generaReproceso !== undefined) where.generaReproceso = query.generaReproceso;

    if (query.fechaDesde || query.fechaHasta) {
      where.creadoEn = {};
      if (query.fechaDesde) where.creadoEn.gte = new Date(query.fechaDesde);
      if (query.fechaHasta) where.creadoEn.lte = new Date(query.fechaHasta);
    }

    if (query.busqueda) {
      where.OR = [
        { consecutivo:  { contains: query.busqueda, mode: 'insensitive' } },
        { descripcion:  { contains: query.busqueda, mode: 'insensitive' } },
        { cliente:      { razonSocial: { contains: query.busqueda, mode: 'insensitive' } } },
      ];
    }

    const [total, registros] = await this.prisma.$transaction([
      this.prisma.pqrs.count({ where }),
      this.prisma.pqrs.findMany({
        where,
        skip,
        take:    limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          cliente:    { select: { id: true, razonSocial: true } },
          tipoNovedad: { select: { id: true, nombre: true } },
          estadoPqrs:  { select: { id: true, nombre: true, codigo: true } },
          creadoPor:   { select: { id: true, nombre: true } },
        },
      }),
    ]);

    const datos: PqrsResumen[] = registros.map((p) => ({
      id:             p.id,
      consecutivo:    p.consecutivo,
      cliente:        p.cliente,
      tipoNovedad:    p.tipoNovedad,
      estadoPqrs:     p.estadoPqrs,
      descripcion:    p.descripcion,
      generaReproceso: p.generaReproceso,
      costoEstimado:  p.costoEstimado ? p.costoEstimado.toNumber() : null,
      creadoPor:      p.creadoPor,
      creadoEn:       p.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  // ===========================================================================
  // OBTENER DETALLE
  // ===========================================================================

  async obtenerPqrs(id: string): Promise<PqrsDetalle> {
    const pqrs = await this.prisma.pqrs.findUnique({
      where: { id },
      include: {
        cliente:             { select: { id: true, razonSocial: true } },
        tipoNovedad:         { select: { id: true, nombre: true } },
        estadoPqrs:          { select: { id: true, nombre: true, codigo: true } },
        creadoPor:           { select: { id: true, nombre: true } },
        responsableSolucion: { select: { id: true, nombre: true } },
        cerradoPor:          { select: { id: true, nombre: true } },
        seguimientos: {
          orderBy: { creadoEn: 'asc' },
          include: { creadoPor: { select: { id: true, nombre: true } } },
        },
        evidencias: {
          orderBy: { creadoEn: 'asc' },
          include: { creadoPor: { select: { id: true, nombre: true } } },
        },
        responsables: {
          orderBy: { creadoEn: 'asc' },
          include: {
            usuario:    { select: { id: true, nombre: true } },
            asignadoPor: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!pqrs) throw new NotFoundException(`PQRS ${id} no encontrada`);

    const seguimientos: SeguimientoPqrsResumen[] = pqrs.seguimientos.map((s) => ({
      id:             s.id,
      tipoSeguimiento: s.tipoSeguimiento,
      descripcion:    s.descripcion,
      observaciones:  s.observaciones,
      creadoPor:      s.creadoPor,
      creadoEn:       s.creadoEn,
    }));

    const evidencias: EvidenciaPqrsResumen[] = pqrs.evidencias.map((e) => ({
      id:            e.id,
      tipoEvidencia: e.tipoEvidencia,
      rutaArchivo:   e.rutaArchivo,
      nombreOriginal: e.nombreOriginal,
      descripcion:   e.descripcion,
      creadoPor:     e.creadoPor,
      creadoEn:      e.creadoEn,
    }));

    const responsables: ResponsablePqrsResumen[] = pqrs.responsables.map((r) => ({
      id:                 r.id,
      usuario:            r.usuario,
      rolResponsable:     r.rolResponsable,
      activo:             r.activo,
      fechaAsignacion:    r.fechaAsignacion,
      fechaFinAsignacion: r.fechaFinAsignacion,
      asignadoPor:        r.asignadoPor,
      observaciones:      r.observaciones,
    }));

    return {
      id:                  pqrs.id,
      consecutivo:         pqrs.consecutivo,
      cliente:             pqrs.cliente,
      tipoNovedad:         pqrs.tipoNovedad,
      estadoPqrs:          pqrs.estadoPqrs,
      descripcion:         pqrs.descripcion,
      generaReproceso:     pqrs.generaReproceso,
      costoEstimado:       pqrs.costoEstimado ? pqrs.costoEstimado.toNumber() : null,
      creadoPor:           pqrs.creadoPor,
      creadoEn:            pqrs.creadoEn,
      pedidoId:            pqrs.pedidoId,
      facturaId:           pqrs.facturaId,
      ordenProduccionId:   pqrs.ordenProduccionId,
      subordenId:          pqrs.subordenId,
      pedidoItemId:        pqrs.pedidoItemId,
      novedadOperativaId:  pqrs.novedadOperativaId,
      reprocesoId:         pqrs.reprocesoId,
      solucionAplicada:    pqrs.solucionAplicada,
      responsableSolucion: pqrs.responsableSolucion,
      cerradoPor:          pqrs.cerradoPor,
      fechaCierre:         pqrs.fechaCierre,
      metadata:            pqrs.metadata as Record<string, unknown> | null,
      seguimientos,
      evidencias,
      responsables,
      actualizadoEn:       pqrs.actualizadoEn,
    };
  }

  // ===========================================================================
  // CAMBIAR ESTADO
  // ===========================================================================

  async cambiarEstadoPqrs(id: string, dto: CambiarEstadoPqrsDto, usuario: UsuarioJwt): Promise<unknown> {
    await this._verificarExistencia(id);
    return this.motorEstados.transicionar({
      modulo:           'pqrs',
      entidad:          'pqrs',
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
  // SEGUIMIENTOS
  // ===========================================================================

  async crearSeguimiento(
    id: string,
    dto: CrearSeguimientoPqrsDto,
    usuario: UsuarioJwt,
  ): Promise<SeguimientoPqrsResumen> {
    await this._verificarExistencia(id);

    const seguimiento = await this.prisma.pqrsSeguimiento.create({
      data: {
        pqrsId:             id,
        creadoPorUsuarioId: usuario.sub,
        tipoSeguimiento:    dto.tipoSeguimiento,
        descripcion:        dto.observaciones,    // observaciones → descripcion (NOT NULL)
        observaciones:      dto.notasInternas,    // notasInternas → observaciones (nullable)
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    return {
      id:              seguimiento.id,
      tipoSeguimiento: seguimiento.tipoSeguimiento,
      descripcion:     seguimiento.descripcion,
      observaciones:   seguimiento.observaciones,
      creadoPor:       seguimiento.creadoPor,
      creadoEn:        seguimiento.creadoEn,
    };
  }

  async obtenerSeguimientos(id: string): Promise<SeguimientoPqrsResumen[]> {
    await this._verificarExistencia(id);

    const seguimientos = await this.prisma.pqrsSeguimiento.findMany({
      where:   { pqrsId: id },
      orderBy: { creadoEn: 'asc' },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    return seguimientos.map((s) => ({
      id:              s.id,
      tipoSeguimiento: s.tipoSeguimiento,
      descripcion:     s.descripcion,
      observaciones:   s.observaciones,
      creadoPor:       s.creadoPor,
      creadoEn:        s.creadoEn,
    }));
  }

  // ===========================================================================
  // EVIDENCIAS
  // ===========================================================================

  async crearEvidencia(
    id: string,
    dto: CrearEvidenciaPqrsDto,
    usuario: UsuarioJwt,
  ): Promise<EvidenciaPqrsResumen> {
    await this._verificarExistencia(id);

    if (dto.tipoEvidencia !== TipoEvidenciaPqrs.OBSERVACION && !dto.rutaArchivo) {
      throw new BadRequestException(
        `rutaArchivo es requerido para evidencia tipo '${dto.tipoEvidencia}'`,
      );
    }

    const evidencia = await this.prisma.pqrsEvidencia.create({
      data: {
        pqrsId:             id,
        creadoPorUsuarioId: usuario.sub,
        tipoEvidencia:      dto.tipoEvidencia,
        rutaArchivo:        dto.rutaArchivo,
        nombreOriginal:     dto.nombreArchivo,   // nombreArchivo → nombreOriginal
        descripcion:        dto.observaciones,   // observaciones → descripcion
      },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    return {
      id:            evidencia.id,
      tipoEvidencia: evidencia.tipoEvidencia,
      rutaArchivo:   evidencia.rutaArchivo,
      nombreOriginal: evidencia.nombreOriginal,
      descripcion:   evidencia.descripcion,
      creadoPor:     evidencia.creadoPor,
      creadoEn:      evidencia.creadoEn,
    };
  }

  async obtenerEvidencias(id: string): Promise<EvidenciaPqrsResumen[]> {
    await this._verificarExistencia(id);

    const evidencias = await this.prisma.pqrsEvidencia.findMany({
      where:   { pqrsId: id },
      orderBy: { creadoEn: 'asc' },
      include: { creadoPor: { select: { id: true, nombre: true } } },
    });

    return evidencias.map((e) => ({
      id:            e.id,
      tipoEvidencia: e.tipoEvidencia,
      rutaArchivo:   e.rutaArchivo,
      nombreOriginal: e.nombreOriginal,
      descripcion:   e.descripcion,
      creadoPor:     e.creadoPor,
      creadoEn:      e.creadoEn,
    }));
  }

  // ===========================================================================
  // RESPONSABLES
  // ===========================================================================

  async asignarResponsable(
    id: string,
    dto: AsignarResponsablePqrsDto,
    usuario: UsuarioJwt,
  ): Promise<ResponsablePqrsResumen> {
    await this._verificarExistencia(id);

    // Validar usuario activo
    const usuarioDestino = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
      select: { id: true, activo: true },
    });
    if (!usuarioDestino) throw new NotFoundException(`Usuario ${dto.usuarioId} no encontrado`);
    if (!usuarioDestino.activo) throw new BadRequestException(`El usuario no está activo`);

    const ahora = new Date();

    const nuevo = await this.prisma.ejecutarTransaccion(async (tx) => {
      // Cerrar asignación activa del mismo rol si existe
      await tx.pqrsResponsable.updateMany({
        where:  { pqrsId: id, rolResponsable: dto.rolResponsable, activo: true },
        data:   { activo: false, fechaFinAsignacion: ahora },
      });

      // Crear nueva asignación
      return tx.pqrsResponsable.create({
        data: {
          pqrsId:              id,
          usuarioId:           dto.usuarioId,
          rolResponsable:      dto.rolResponsable,
          activo:              true,
          fechaAsignacion:     ahora,
          asignadoPorUsuarioId: usuario.sub,
          observaciones:       dto.observaciones,
        },
        include: {
          usuario:    { select: { id: true, nombre: true } },
          asignadoPor: { select: { id: true, nombre: true } },
        },
      });
    });

    return {
      id:                 nuevo.id,
      usuario:            nuevo.usuario,
      rolResponsable:     nuevo.rolResponsable,
      activo:             nuevo.activo,
      fechaAsignacion:    nuevo.fechaAsignacion,
      fechaFinAsignacion: nuevo.fechaFinAsignacion,
      asignadoPor:        nuevo.asignadoPor,
      observaciones:      nuevo.observaciones,
    };
  }

  async obtenerResponsables(id: string): Promise<ResponsablePqrsResumen[]> {
    await this._verificarExistencia(id);

    const responsables = await this.prisma.pqrsResponsable.findMany({
      where:   { pqrsId: id },
      orderBy: { creadoEn: 'asc' },
      include: {
        usuario:    { select: { id: true, nombre: true } },
        asignadoPor: { select: { id: true, nombre: true } },
      },
    });

    return responsables.map((r) => ({
      id:                 r.id,
      usuario:            r.usuario,
      rolResponsable:     r.rolResponsable,
      activo:             r.activo,
      fechaAsignacion:    r.fechaAsignacion,
      fechaFinAsignacion: r.fechaFinAsignacion,
      asignadoPor:        r.asignadoPor,
      observaciones:      r.observaciones,
    }));
  }

  // ===========================================================================
  // PRIVADOS
  // ===========================================================================

  private async _verificarExistencia(id: string): Promise<void> {
    const existe = await this.prisma.pqrs.findUnique({ where: { id }, select: { id: true } });
    if (!existe) throw new NotFoundException(`PQRS ${id} no encontrada`);
  }

  private async _generarConsecutivo(): Promise<string> {
    const hoy   = new Date();
    const yyyy  = hoy.getFullYear();
    const mm    = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd    = String(hoy.getDate()).padStart(2, '0');
    const fecha = `${yyyy}${mm}${dd}`;

    // Contar PQRS del día para el sufijo secuencial
    const inicioDia = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`);
    const finDia    = new Date(`${yyyy}-${mm}-${dd}T23:59:59.999Z`);

    const conteo = await this.prisma.pqrs.count({
      where: { creadoEn: { gte: inicioDia, lte: finDia } },
    });

    const secuencia = String(conteo + 1).padStart(4, '0');
    return `PQRS-${fecha}-${secuencia}`;
  }
}
