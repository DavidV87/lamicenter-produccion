import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { AuditoriaServicio } from '../../common/services/auditoria.servicio';
import { MotorEstadosServicio } from '../../common/motor-estados/motor-estados.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { CrearPedidoDto } from './dto/crear-pedido.dto';
import { ListarPedidosQueryDto } from './dto/listar-pedidos-query.dto';
import { CambiarEstadoPedidoDto } from './dto/cambiar-estado-pedido.dto';
import { ValidarPedidoDto } from './dto/validar-pedido.dto';
import { ListaPaginadaPedidos, PedidoResumen } from './interfaces/pedido-lista.interface';
import {
  HistorialEstadoResumen,
  PedidoDetalle,
  PedidoItemDetalle,
  ValidacionResumen,
} from './interfaces/pedido-detalle.interface';
import { ResultadoTransicion } from '../../common/motor-estados/interfaces/resultado-transicion.interface';

@Injectable()
export class PedidosServicio {
  private readonly logger = new Logger(PedidosServicio.name);

  constructor(
    private readonly prisma: PrismaServicio,
    private readonly auditoria: AuditoriaServicio,
    private readonly motorEstados: MotorEstadosServicio,
  ) {}

  // ---------------------------------------------------------------------------
  // Crear pedido
  // ---------------------------------------------------------------------------

  async crearPedido(dto: CrearPedidoDto, usuario: UsuarioJwt): Promise<PedidoDetalle> {
    const estadoBorrador = await this.prisma.estadoSistema.findUniqueOrThrow({
      where: { modulo_codigo: { modulo: 'pedido', codigo: 'borrador' } },
    });

    const pedido = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevoPedido = await tx.pedido.create({
        data: {
          sedeVentaId:           dto.sedeVentaId,
          sedeResponsableId:     dto.sedeResponsableId,
          sedeDespachoId:        dto.sedeDespachoId,
          clienteId:             dto.clienteId,
          vendedorId:            dto.vendedorId,
          creadoPorUsuarioId:    usuario.sub,
          estadoPedidoId:        estadoBorrador.id,
          observaciones:         dto.observaciones,
          fechaEntregaPrometida: dto.fechaEntregaPrometida
            ? new Date(dto.fechaEntregaPrometida)
            : null,
          metadata: dto.metadata
            ? (dto.metadata as unknown as Prisma.InputJsonValue)
            : undefined,
        },
      });

      if (dto.items.length > 0) {
        await tx.pedidoItem.createMany({
          data: dto.items.map((item) => ({
            pedidoId:                  nuevoPedido.id,
            itemId:                    item.itemId,
            facturaItemId:             item.facturaItemId,
            descripcion:               item.descripcion,
            cantidad:                  item.cantidad,
            cantidadTotal:             item.cantidadTotal,
            cantidadParaProduccion:    item.cantidadParaProduccion,
            cantidadParaDespachoEntero: item.cantidadParaDespachoEntero,
            // Snapshot inmutable: al crear, todo está pendiente
            cantidadPendiente:         item.cantidadTotal,
            precioUnitario:            item.precioUnitario,
            destinoOperativo:          item.destinoOperativo,
            esMaterialCliente:         item.esMaterialCliente ?? false,
            observaciones:             item.observaciones,
            metadata: item.metadata
              ? (item.metadata as unknown as Prisma.InputJsonValue)
              : undefined,
          })),
        });
      }

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'pedidos',
          registroId:    nuevoPedido.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            clienteId:         dto.clienteId,
            sedeVentaId:       dto.sedeVentaId,
            sedeResponsableId: dto.sedeResponsableId,
            totalItems:        dto.items.length,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevoPedido;
    });

    return this.obtenerPedido(pedido.id);
  }

  // ---------------------------------------------------------------------------
  // Listar pedidos con filtros y paginación
  // ---------------------------------------------------------------------------

  async listarPedidos(
    query: ListarPedidosQueryDto,
    _usuario: UsuarioJwt,
  ): Promise<ListaPaginadaPedidos> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar  = (pagina - 1) * limite;

    const donde: Prisma.PedidoWhereInput = {};

    if (query.clienteId)  donde.clienteId  = query.clienteId;
    if (query.vendedorId) donde.vendedorId = query.vendedorId;
    if (query.estadoId)   donde.estadoPedidoId = query.estadoId;

    if (query.sedeId) {
      donde.OR = [
        { sedeVentaId: query.sedeId },
        { sedeResponsableId: query.sedeId },
      ];
    }

    if (query.busqueda) {
      donde.cliente = {
        razonSocial: { contains: query.busqueda, mode: 'insensitive' },
      };
    }

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.pedido.findMany({
        where: donde,
        skip: saltar,
        take: limite,
        orderBy: { creadoEn: 'desc' },
        include: {
          cliente:         { select: { id: true, razonSocial: true } },
          sedeVenta:       { select: { id: true, nombre: true } },
          sedeResponsable: { select: { id: true, nombre: true } },
          vendedor:        { select: { id: true, nombre: true } },
          estadoPedido:    { select: { id: true, codigo: true, nombre: true } },
          _count: { select: { items: true } },
        },
      }),
      this.prisma.pedido.count({ where: donde }),
    ]);

    const datos: PedidoResumen[] = registros.map((p) => ({
      id:              p.id,
      cliente:         { id: p.cliente.id, razonSocial: p.cliente.razonSocial },
      sedeVenta:       { id: p.sedeVenta.id, nombre: p.sedeVenta.nombre },
      sedeResponsable: { id: p.sedeResponsable.id, nombre: p.sedeResponsable.nombre },
      vendedor:        p.vendedor ? { id: p.vendedor.id, nombre: p.vendedor.nombre } : null,
      estado:          { id: p.estadoPedido.id, codigo: p.estadoPedido.codigo, nombre: p.estadoPedido.nombre },
      totalItems:      p._count.items,
      observaciones:   p.observaciones,
      creadoEn:        p.creadoEn,
      actualizadoEn:   p.actualizadoEn,
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
  // Obtener detalle completo de un pedido
  // ---------------------------------------------------------------------------

  async obtenerPedido(id: string): Promise<PedidoDetalle> {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente:         { select: { id: true, razonSocial: true } },
        sedeVenta:       { select: { id: true, nombre: true } },
        sedeResponsable: { select: { id: true, nombre: true } },
        sedeDespacho:    { select: { id: true, nombre: true } },
        vendedor:        { select: { id: true, nombre: true } },
        creadoPor:       { select: { id: true, nombre: true } },
        estadoPedido:    { select: { id: true, codigo: true, nombre: true } },
        items: {
          orderBy: { creadoEn: 'asc' },
          include: {
            item: { select: { id: true, nombre: true, codigo: true } },
          },
        },
        validaciones: {
          orderBy: { creadoEn: 'desc' },
          include: {
            validadoPor: { select: { id: true, nombre: true } },
            detalles: {
              orderBy: { creadoEn: 'asc' },
            },
          },
        },
      },
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }

    const items: PedidoItemDetalle[] = pedido.items.map((it) => ({
      id:                         it.id,
      descripcion:                it.descripcion,
      cantidad:                   it.cantidad.toNumber(),
      cantidadTotal:              it.cantidadTotal.toNumber(),
      cantidadParaProduccion:     it.cantidadParaProduccion.toNumber(),
      cantidadParaDespachoEntero: it.cantidadParaDespachoEntero.toNumber(),
      cantidadPendiente:          it.cantidadPendiente.toNumber(),
      precioUnitario:             it.precioUnitario ? it.precioUnitario.toNumber() : null,
      destinoOperativo:           it.destinoOperativo,
      esMaterialCliente:          it.esMaterialCliente,
      observaciones:              it.observaciones,
      item:                       it.item ? { id: it.item.id, nombre: it.item.nombre, codigo: it.item.codigo } : null,
      creadoEn:                   it.creadoEn,
    }));

    const validaciones: ValidacionResumen[] = pedido.validaciones.map((v) => ({
      id:               v.id,
      estadoValidacion: v.estadoValidacion,
      validadoPor:      v.validadoPor ? { id: v.validadoPor.id, nombre: v.validadoPor.nombre } : null,
      observaciones:    v.observaciones,
      detalles:         v.detalles.map((d) => ({
        id:               d.id,
        tipoVerificacion: d.tipoVerificacion,
        aprobado:         d.aprobado,
        observaciones:    d.observaciones,
      })),
      creadoEn: v.creadoEn,
    }));

    return {
      id:                   pedido.id,
      cliente:              { id: pedido.cliente.id, razonSocial: pedido.cliente.razonSocial },
      sedeVenta:            { id: pedido.sedeVenta.id, nombre: pedido.sedeVenta.nombre },
      sedeResponsable:      { id: pedido.sedeResponsable.id, nombre: pedido.sedeResponsable.nombre },
      sedeDespacho:         pedido.sedeDespacho ? { id: pedido.sedeDespacho.id, nombre: pedido.sedeDespacho.nombre } : null,
      vendedor:             pedido.vendedor ? { id: pedido.vendedor.id, nombre: pedido.vendedor.nombre } : null,
      creadoPor:            { id: pedido.creadoPor.id, nombre: pedido.creadoPor.nombre },
      estado:               { id: pedido.estadoPedido.id, codigo: pedido.estadoPedido.codigo, nombre: pedido.estadoPedido.nombre },
      items,
      validaciones,
      observaciones:         pedido.observaciones,
      fechaEntregaPrometida: pedido.fechaEntregaPrometida,
      fechaListoDespacho:    pedido.fechaListoDespacho,
      fechaDespachoCompleto: pedido.fechaDespachoCompleto,
      metadata:             pedido.metadata as Record<string, unknown> | null,
      creadoEn:             pedido.creadoEn,
      actualizadoEn:        pedido.actualizadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Cambiar estado del pedido via motor de estados
  // ---------------------------------------------------------------------------

  async cambiarEstado(
    id: string,
    dto: CambiarEstadoPedidoDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoTransicion> {
    await this.verificarExistencia(id);

    return this.motorEstados.transicionar({
      modulo:           'pedido',
      entidad:          'pedido',
      entidadId:        id,
      estadoNuevoCodigo: dto.estadoNuevoCodigo,
      usuarioId:        usuario.sub,
      rolId:            usuario.rolId,
      autorizadorId:    dto.autorizadorId,
      observaciones:    dto.observaciones,
      metadata:         dto.metadata,
      forzar:           dto.forzar,
    });
  }

  // ---------------------------------------------------------------------------
  // Registrar validación formal del pedido
  // ---------------------------------------------------------------------------

  async validarPedido(
    id: string,
    dto: ValidarPedidoDto,
    usuario: UsuarioJwt,
  ): Promise<ValidacionResumen> {
    await this.verificarExistencia(id);

    const validacion = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevaValidacion = await tx.validacionPedido.create({
        data: {
          pedidoId:            id,
          validadoPorUsuarioId: usuario.sub,
          estadoValidacion:    dto.estadoValidacion,
          observaciones:       dto.observaciones,
          metadata: dto.metadata
            ? (dto.metadata as unknown as Prisma.InputJsonValue)
            : undefined,
        },
      });

      if (dto.detalles && dto.detalles.length > 0) {
        await tx.validacionPedidoDetalle.createMany({
          data: dto.detalles.map((d) => ({
            validacionPedidoId: nuevaValidacion.id,
            tipoVerificacion:   d.tipoVerificacion,
            aprobado:           d.aprobado,
            observaciones:      d.observaciones,
          })),
        });
      }

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'validaciones_pedido',
          registroId:    nuevaValidacion.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos: {
            pedidoId:         id,
            estadoValidacion: dto.estadoValidacion,
            totalDetalles:    dto.detalles?.length ?? 0,
          } as unknown as Prisma.InputJsonValue,
          usuarioId: usuario.sub,
        },
      });

      return nuevaValidacion;
    });

    const completa = await this.prisma.validacionPedido.findUniqueOrThrow({
      where: { id: validacion.id },
      include: {
        validadoPor: { select: { id: true, nombre: true } },
        detalles:    { orderBy: { creadoEn: 'asc' } },
      },
    });

    return {
      id:               completa.id,
      estadoValidacion: completa.estadoValidacion,
      validadoPor:      completa.validadoPor
        ? { id: completa.validadoPor.id, nombre: completa.validadoPor.nombre }
        : null,
      observaciones:    completa.observaciones,
      detalles:         completa.detalles.map((d) => ({
        id:               d.id,
        tipoVerificacion: d.tipoVerificacion,
        aprobado:         d.aprobado,
        observaciones:    d.observaciones,
      })),
      creadoEn: completa.creadoEn,
    };
  }

  // ---------------------------------------------------------------------------
  // Historial de estados del pedido
  // ---------------------------------------------------------------------------

  async obtenerHistorial(id: string): Promise<HistorialEstadoResumen[]> {
    await this.verificarExistencia(id);

    const historial = await this.prisma.historialEstadoPedido.findMany({
      where: { pedidoId: id },
      orderBy: { creadoEn: 'asc' },
      include: {
        estadoAnterior: { select: { id: true, codigo: true, nombre: true } },
        estadoNuevo:    { select: { id: true, codigo: true, nombre: true } },
        creadoPor:      { select: { id: true, nombre: true } },
      },
    });

    return historial.map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior
        ? { id: h.estadoAnterior.id, codigo: h.estadoAnterior.codigo, nombre: h.estadoAnterior.nombre }
        : null,
      estadoNuevo: { id: h.estadoNuevo.id, codigo: h.estadoNuevo.codigo, nombre: h.estadoNuevo.nombre },
      creadoPor: h.creadoPor
        ? { id: h.creadoPor.id, nombre: h.creadoPor.nombre }
        : null,
      observaciones: h.observaciones,
      creadoEn:      h.creadoEn,
    }));
  }

  // ---------------------------------------------------------------------------
  // Utilidades privadas
  // ---------------------------------------------------------------------------

  private async verificarExistencia(id: string): Promise<void> {
    const existe = await this.prisma.pedido.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existe) {
      throw new NotFoundException(`Pedido ${id} no encontrado`);
    }
  }
}
