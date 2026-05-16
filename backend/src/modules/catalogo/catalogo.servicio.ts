import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TipoAccionAuditoria, TipoItem, Sede } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';

import { CrearClienteDto } from './dto/crear-cliente.dto';
import { ActualizarClienteDto } from './dto/actualizar-cliente.dto';
import { ListarClientesQueryDto } from './dto/listar-clientes-query.dto';
import { CrearItemDto } from './dto/crear-item.dto';
import { ActualizarItemDto } from './dto/actualizar-item.dto';
import { ListarItemsQueryDto } from './dto/listar-items-query.dto';
import { CrearProveedorDto } from './dto/crear-proveedor.dto';
import { ActualizarProveedorDto } from './dto/actualizar-proveedor.dto';
import { ListarProveedoresQueryDto } from './dto/listar-proveedores-query.dto';
import { CrearMaquinaDto } from './dto/crear-maquina.dto';
import { ActualizarMaquinaDto } from './dto/actualizar-maquina.dto';
import { ListarMaquinasQueryDto } from './dto/listar-maquinas-query.dto';
import { CrearUbicacionDto } from './dto/crear-ubicacion.dto';
import { ActualizarUbicacionDto } from './dto/actualizar-ubicacion.dto';
import { ListarUbicacionesQueryDto } from './dto/listar-ubicaciones-query.dto';

import {
  ClienteDetalle,
  ClienteResumen,
  ItemDetalle,
  ItemResumen,
  ListaPaginadaClientes,
  ListaPaginadaItems,
  ListaPaginadaMaquinas,
  ListaPaginadaProveedores,
  ListaPaginadaUbicaciones,
  MaquinaDetalle,
  MaquinaResumen,
  ProveedorDetalle,
  ProveedorResumen,
  UbicacionDetalle,
  UbicacionResumen,
} from './interfaces/catalogo.interfaces';

@Injectable()
export class CatalogoServicio {
  private readonly logger = new Logger(CatalogoServicio.name);

  constructor(private readonly prisma: PrismaServicio) {}

  // ===========================================================================
  // CLIENTES
  // ===========================================================================

  async crearCliente(dto: CrearClienteDto, usuario: UsuarioJwt): Promise<ClienteDetalle> {
    const duplicado = await this.prisma.cliente.findFirst({
      where: { identificacion: dto.identificacion },
      select: { id: true },
    });
    if (duplicado) {
      throw new ConflictException(`Ya existe un cliente con identificación ${dto.identificacion}`);
    }

    if (dto.sedePrincipalId) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedePrincipalId },
        select: { id: true, activo: true },
      });
      if (!sede || !sede.activo) {
        throw new NotFoundException(`Sede ${dto.sedePrincipalId} no encontrada o inactiva`);
      }
    }

    const cliente = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevo = await tx.cliente.create({
        data: {
          razonSocial:        dto.razonSocial,
          nombreComercial:    dto.nombreComercial,
          identificacion:     dto.identificacion,
          tipoIdentificacion: dto.tipoIdentificacion,
          sedePrincipalId:    dto.sedePrincipalId,
          telefono:           dto.telefono,
          correo:             dto.correo,
          direccion:          dto.direccion,
          ciudad:             dto.ciudad,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'clientes',
          registroId:    nuevo.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { razonSocial: dto.razonSocial, identificacion: dto.identificacion } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nuevo;
    });

    this.logger.log(`[Catalogo] Cliente creado: id=${cliente.id} por=${usuario.sub}`);
    return this.obtenerCliente(cliente.id);
  }

  async listarClientes(query: ListarClientesQueryDto): Promise<ListaPaginadaClientes> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.ClienteWhereInput = {};
    if (query.busqueda) {
      donde.OR = [
        { razonSocial:     { contains: query.busqueda, mode: 'insensitive' } },
        { nombreComercial: { contains: query.busqueda, mode: 'insensitive' } },
        { identificacion:  { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined) donde.activo = query.activo;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { razonSocial: 'asc' },
        include: { sedePrincipal: { select: { id: true, nombre: true } } },
      }),
      this.prisma.cliente.count({ where: donde }),
    ]);

    const datos: ClienteResumen[] = registros.map((c) => ({
      id:                c.id,
      razonSocial:       c.razonSocial,
      nombreComercial:   c.nombreComercial,
      identificacion:    c.identificacion,
      tipoIdentificacion: c.tipoIdentificacion,
      sedePrincipal:     c.sedePrincipal,
      telefono:          c.telefono,
      correo:            c.correo,
      ciudad:            c.ciudad,
      activo:            c.activo,
      creadoEn:          c.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerCliente(id: string): Promise<ClienteDetalle> {
    const cliente = await this.prisma.cliente.findUnique({
      where:   { id },
      include: {
        sedePrincipal: { select: { id: true, nombre: true } },
        contactos:     { select: { id: true, nombre: true, cargo: true, telefono: true, correo: true, esPrincipal: true, activo: true } },
      },
    });
    if (!cliente) throw new NotFoundException(`Cliente ${id} no encontrado`);

    return {
      id:                cliente.id,
      razonSocial:       cliente.razonSocial,
      nombreComercial:   cliente.nombreComercial,
      identificacion:    cliente.identificacion,
      tipoIdentificacion: cliente.tipoIdentificacion,
      sedePrincipal:     cliente.sedePrincipal,
      telefono:          cliente.telefono,
      correo:            cliente.correo,
      direccion:         cliente.direccion,
      ciudad:            cliente.ciudad,
      activo:            cliente.activo,
      creadoEn:          cliente.creadoEn,
      actualizadoEn:     cliente.actualizadoEn,
      contactos:         cliente.contactos,
    };
  }

  async actualizarCliente(id: string, dto: ActualizarClienteDto, usuario: UsuarioJwt): Promise<ClienteDetalle> {
    const actual = await this.prisma.cliente.findUnique({
      where:  { id },
      select: { id: true, identificacion: true },
    });
    if (!actual) throw new NotFoundException(`Cliente ${id} no encontrado`);

    if (dto.identificacion && dto.identificacion !== actual.identificacion) {
      const duplicado = await this.prisma.cliente.findFirst({
        where: { identificacion: dto.identificacion, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException(`Ya existe un cliente con identificación ${dto.identificacion}`);
    }

    if (dto.sedePrincipalId) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedePrincipalId },
        select: { id: true, activo: true },
      });
      if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedePrincipalId} no encontrada o inactiva`);
    }

    await this.prisma.cliente.update({
      where: { id },
      data:  {
        razonSocial:        dto.razonSocial,
        nombreComercial:    dto.nombreComercial,
        identificacion:     dto.identificacion,
        tipoIdentificacion: dto.tipoIdentificacion,
        sedePrincipalId:    dto.sedePrincipalId,
        telefono:           dto.telefono,
        correo:             dto.correo,
        direccion:          dto.direccion,
        ciudad:             dto.ciudad,
        activo:             dto.activo,
      },
    });

    this.logger.log(`[Catalogo] Cliente actualizado: id=${id} por=${usuario.sub}`);
    return this.obtenerCliente(id);
  }

  // ===========================================================================
  // ITEMS
  // ===========================================================================

  async crearItem(dto: CrearItemDto, usuario: UsuarioJwt): Promise<ItemDetalle> {
    const duplicado = await this.prisma.item.findFirst({
      where: { codigo: dto.codigo },
      select: { id: true },
    });
    if (duplicado) throw new ConflictException(`Ya existe un ítem con código ${dto.codigo}`);

    const tipoItem = await this.prisma.tipoItem.findUnique({
      where:  { id: dto.tipoItemId },
      select: { id: true, activo: true },
    });
    if (!tipoItem || !tipoItem.activo) {
      throw new NotFoundException(`Tipo de ítem ${dto.tipoItemId} no encontrado o inactivo`);
    }

    const item = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevo = await tx.item.create({
        data: {
          tipoItemId:           dto.tipoItemId,
          codigo:               dto.codigo,
          nombre:               dto.nombre,
          descripcion:          dto.descripcion,
          unidadMedida:         dto.unidadMedida,
          precioVentaReferencia: dto.precioVentaReferencia,
          costoReferencia:      dto.costoReferencia,
          controlaInventario:   dto.controlaInventario ?? false,
          requiereCorte:        dto.requiereCorte ?? false,
          permiteFraccion:      dto.permiteFraccion ?? false,
          metadata:             dto.metadata as Prisma.InputJsonValue | undefined,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'items',
          registroId:    nuevo.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { codigo: dto.codigo, nombre: dto.nombre, tipoItemId: dto.tipoItemId } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nuevo;
    });

    this.logger.log(`[Catalogo] Ítem creado: id=${item.id} codigo=${dto.codigo} por=${usuario.sub}`);
    return this.obtenerItem(item.id);
  }

  async listarItems(query: ListarItemsQueryDto): Promise<ListaPaginadaItems> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.ItemWhereInput = {};
    if (query.busqueda) {
      donde.OR = [
        { nombre: { contains: query.busqueda, mode: 'insensitive' } },
        { codigo: { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined) donde.activo = query.activo;
    if (query.tipoItemId)   donde.tipoItemId   = query.tipoItemId;
    if (query.unidadMedida) donde.unidadMedida = query.unidadMedida;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.item.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { nombre: 'asc' },
        include: { tipoItem: { select: { id: true, nombre: true, comportamiento: true } } },
      }),
      this.prisma.item.count({ where: donde }),
    ]);

    const datos: ItemResumen[] = registros.map((i) => ({
      id:                   i.id,
      tipoItem:             { id: i.tipoItem.id, nombre: i.tipoItem.nombre, comportamiento: i.tipoItem.comportamiento },
      codigo:               i.codigo,
      nombre:               i.nombre,
      unidadMedida:         i.unidadMedida,
      precioVentaReferencia: i.precioVentaReferencia ? i.precioVentaReferencia.toNumber() : null,
      costoReferencia:      i.costoReferencia ? i.costoReferencia.toNumber() : null,
      controlaInventario:   i.controlaInventario,
      requiereCorte:        i.requiereCorte,
      permiteFraccion:      i.permiteFraccion,
      activo:               i.activo,
      creadoEn:             i.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerItem(id: string): Promise<ItemDetalle> {
    const item = await this.prisma.item.findUnique({
      where:   { id },
      include: { tipoItem: { select: { id: true, nombre: true, comportamiento: true } } },
    });
    if (!item) throw new NotFoundException(`Ítem ${id} no encontrado`);

    return {
      id:                   item.id,
      tipoItem:             { id: item.tipoItem.id, nombre: item.tipoItem.nombre, comportamiento: item.tipoItem.comportamiento },
      codigo:               item.codigo,
      nombre:               item.nombre,
      descripcion:          item.descripcion,
      unidadMedida:         item.unidadMedida,
      precioVentaReferencia: item.precioVentaReferencia ? item.precioVentaReferencia.toNumber() : null,
      costoReferencia:      item.costoReferencia ? item.costoReferencia.toNumber() : null,
      controlaInventario:   item.controlaInventario,
      requiereCorte:        item.requiereCorte,
      permiteFraccion:      item.permiteFraccion,
      metadata:             item.metadata,
      activo:               item.activo,
      creadoEn:             item.creadoEn,
      actualizadoEn:        item.actualizadoEn,
    };
  }

  async actualizarItem(id: string, dto: ActualizarItemDto, usuario: UsuarioJwt): Promise<ItemDetalle> {
    const actual = await this.prisma.item.findUnique({
      where:  { id },
      select: { id: true, codigo: true },
    });
    if (!actual) throw new NotFoundException(`Ítem ${id} no encontrado`);

    if (dto.codigo && dto.codigo !== actual.codigo) {
      const duplicado = await this.prisma.item.findFirst({
        where: { codigo: dto.codigo, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException(`Ya existe un ítem con código ${dto.codigo}`);
    }

    if (dto.tipoItemId) {
      const tipoItem = await this.prisma.tipoItem.findUnique({
        where:  { id: dto.tipoItemId },
        select: { id: true, activo: true },
      });
      if (!tipoItem || !tipoItem.activo) throw new NotFoundException(`Tipo de ítem ${dto.tipoItemId} no encontrado o inactivo`);
    }

    await this.prisma.item.update({
      where: { id },
      data:  {
        tipoItemId:           dto.tipoItemId,
        codigo:               dto.codigo,
        nombre:               dto.nombre,
        descripcion:          dto.descripcion,
        unidadMedida:         dto.unidadMedida,
        precioVentaReferencia: dto.precioVentaReferencia,
        costoReferencia:      dto.costoReferencia,
        controlaInventario:   dto.controlaInventario,
        requiereCorte:        dto.requiereCorte,
        permiteFraccion:      dto.permiteFraccion,
        metadata:             dto.metadata !== undefined ? (dto.metadata as Prisma.InputJsonValue) : undefined,
        activo:               dto.activo,
      },
    });

    this.logger.log(`[Catalogo] Ítem actualizado: id=${id} por=${usuario.sub}`);
    return this.obtenerItem(id);
  }

  // ===========================================================================
  // PROVEEDORES
  // ===========================================================================

  async crearProveedor(dto: CrearProveedorDto, usuario: UsuarioJwt): Promise<ProveedorDetalle> {
    const duplicado = await this.prisma.proveedor.findFirst({
      where: { identificacion: dto.identificacion },
      select: { id: true },
    });
    if (duplicado) throw new ConflictException(`Ya existe un proveedor con identificación ${dto.identificacion}`);

    const proveedor = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nuevo = await tx.proveedor.create({
        data: {
          razonSocial:        dto.razonSocial,
          nombreComercial:    dto.nombreComercial,
          identificacion:     dto.identificacion,
          tipoIdentificacion: dto.tipoIdentificacion,
          tipoProveedor:      dto.tipoProveedor,
          telefono:           dto.telefono,
          correo:             dto.correo,
          direccion:          dto.direccion,
          ciudad:             dto.ciudad,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'proveedores',
          registroId:    nuevo.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { razonSocial: dto.razonSocial, identificacion: dto.identificacion } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nuevo;
    });

    this.logger.log(`[Catalogo] Proveedor creado: id=${proveedor.id} por=${usuario.sub}`);
    return this.obtenerProveedor(proveedor.id);
  }

  async listarProveedores(query: ListarProveedoresQueryDto): Promise<ListaPaginadaProveedores> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.ProveedorWhereInput = {};
    if (query.busqueda) {
      donde.OR = [
        { razonSocial:     { contains: query.busqueda, mode: 'insensitive' } },
        { nombreComercial: { contains: query.busqueda, mode: 'insensitive' } },
        { identificacion:  { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined)  donde.activo       = query.activo;
    if (query.tipoProveedor)         donde.tipoProveedor = query.tipoProveedor;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.proveedor.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { razonSocial: 'asc' },
      }),
      this.prisma.proveedor.count({ where: donde }),
    ]);

    const datos: ProveedorResumen[] = registros.map((p) => ({
      id:                p.id,
      razonSocial:       p.razonSocial,
      nombreComercial:   p.nombreComercial,
      identificacion:    p.identificacion,
      tipoIdentificacion: p.tipoIdentificacion,
      tipoProveedor:     p.tipoProveedor,
      telefono:          p.telefono,
      correo:            p.correo,
      ciudad:            p.ciudad,
      activo:            p.activo,
      creadoEn:          p.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerProveedor(id: string): Promise<ProveedorDetalle> {
    const proveedor = await this.prisma.proveedor.findUnique({ where: { id } });
    if (!proveedor) throw new NotFoundException(`Proveedor ${id} no encontrado`);

    return {
      id:                proveedor.id,
      razonSocial:       proveedor.razonSocial,
      nombreComercial:   proveedor.nombreComercial,
      identificacion:    proveedor.identificacion,
      tipoIdentificacion: proveedor.tipoIdentificacion,
      tipoProveedor:     proveedor.tipoProveedor,
      telefono:          proveedor.telefono,
      correo:            proveedor.correo,
      direccion:         proveedor.direccion,
      ciudad:            proveedor.ciudad,
      activo:            proveedor.activo,
      creadoEn:          proveedor.creadoEn,
      actualizadoEn:     proveedor.actualizadoEn,
    };
  }

  async actualizarProveedor(id: string, dto: ActualizarProveedorDto, usuario: UsuarioJwt): Promise<ProveedorDetalle> {
    const actual = await this.prisma.proveedor.findUnique({
      where:  { id },
      select: { id: true, identificacion: true },
    });
    if (!actual) throw new NotFoundException(`Proveedor ${id} no encontrado`);

    if (dto.identificacion && dto.identificacion !== actual.identificacion) {
      const duplicado = await this.prisma.proveedor.findFirst({
        where: { identificacion: dto.identificacion, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException(`Ya existe un proveedor con identificación ${dto.identificacion}`);
    }

    await this.prisma.proveedor.update({
      where: { id },
      data:  {
        razonSocial:        dto.razonSocial,
        nombreComercial:    dto.nombreComercial,
        identificacion:     dto.identificacion,
        tipoIdentificacion: dto.tipoIdentificacion,
        tipoProveedor:      dto.tipoProveedor,
        telefono:           dto.telefono,
        correo:             dto.correo,
        direccion:          dto.direccion,
        ciudad:             dto.ciudad,
        activo:             dto.activo,
      },
    });

    this.logger.log(`[Catalogo] Proveedor actualizado: id=${id} por=${usuario.sub}`);
    return this.obtenerProveedor(id);
  }

  // ===========================================================================
  // MAQUINAS
  // ===========================================================================

  async crearMaquina(dto: CrearMaquinaDto, usuario: UsuarioJwt): Promise<MaquinaDetalle> {
    const duplicado = await this.prisma.maquina.findFirst({
      where: { codigo: dto.codigo },
      select: { id: true },
    });
    if (duplicado) throw new ConflictException(`Ya existe una máquina con código ${dto.codigo}`);

    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);

    const maquina = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nueva = await tx.maquina.create({
        data: {
          sedeId:      dto.sedeId,
          nombre:      dto.nombre,
          codigo:      dto.codigo,
          descripcion: dto.descripcion,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'maquinas',
          registroId:    nueva.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { codigo: dto.codigo, nombre: dto.nombre, sedeId: dto.sedeId } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nueva;
    });

    this.logger.log(`[Catalogo] Máquina creada: id=${maquina.id} codigo=${dto.codigo} por=${usuario.sub}`);
    return this.obtenerMaquina(maquina.id);
  }

  async listarMaquinas(query: ListarMaquinasQueryDto): Promise<ListaPaginadaMaquinas> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.MaquinaWhereInput = {};
    if (query.busqueda) {
      donde.OR = [
        { nombre: { contains: query.busqueda, mode: 'insensitive' } },
        { codigo: { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined) donde.activo = query.activo;
    if (query.sedeId)               donde.sedeId = query.sedeId;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.maquina.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { nombre: 'asc' },
        include: { sede: { select: { id: true, nombre: true } } },
      }),
      this.prisma.maquina.count({ where: donde }),
    ]);

    const datos: MaquinaResumen[] = registros.map((m) => ({
      id:       m.id,
      sede:     { id: m.sede.id, nombre: m.sede.nombre },
      nombre:   m.nombre,
      codigo:   m.codigo,
      activo:   m.activo,
      creadoEn: m.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerMaquina(id: string): Promise<MaquinaDetalle> {
    const maquina = await this.prisma.maquina.findUnique({
      where:   { id },
      include: { sede: { select: { id: true, nombre: true } } },
    });
    if (!maquina) throw new NotFoundException(`Máquina ${id} no encontrada`);

    return {
      id:           maquina.id,
      sede:         { id: maquina.sede.id, nombre: maquina.sede.nombre },
      nombre:       maquina.nombre,
      codigo:       maquina.codigo,
      descripcion:  maquina.descripcion,
      activo:       maquina.activo,
      creadoEn:     maquina.creadoEn,
      actualizadoEn: maquina.actualizadoEn,
    };
  }

  async actualizarMaquina(id: string, dto: ActualizarMaquinaDto, usuario: UsuarioJwt): Promise<MaquinaDetalle> {
    const actual = await this.prisma.maquina.findUnique({
      where:  { id },
      select: { id: true, codigo: true },
    });
    if (!actual) throw new NotFoundException(`Máquina ${id} no encontrada`);

    if (dto.codigo && dto.codigo !== actual.codigo) {
      const duplicado = await this.prisma.maquina.findFirst({
        where: { codigo: dto.codigo, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException(`Ya existe una máquina con código ${dto.codigo}`);
    }

    if (dto.sedeId) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedeId },
        select: { id: true, activo: true },
      });
      if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);
    }

    await this.prisma.maquina.update({
      where: { id },
      data:  {
        sedeId:      dto.sedeId,
        nombre:      dto.nombre,
        codigo:      dto.codigo,
        descripcion: dto.descripcion,
        activo:      dto.activo,
      },
    });

    this.logger.log(`[Catalogo] Máquina actualizada: id=${id} por=${usuario.sub}`);
    return this.obtenerMaquina(id);
  }

  // ===========================================================================
  // UBICACIONES
  // ===========================================================================

  async crearUbicacion(dto: CrearUbicacionDto, usuario: UsuarioJwt): Promise<UbicacionDetalle> {
    const duplicado = await this.prisma.ubicacion.findFirst({
      where: { codigo: dto.codigo },
      select: { id: true },
    });
    if (duplicado) throw new ConflictException(`Ya existe una ubicación con código ${dto.codigo}`);

    const sede = await this.prisma.sede.findUnique({
      where:  { id: dto.sedeId },
      select: { id: true, activo: true },
    });
    if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);

    const ubicacion = await this.prisma.ejecutarTransaccion(async (tx) => {
      const nueva = await tx.ubicacion.create({
        data: {
          sedeId:      dto.sedeId,
          nombre:      dto.nombre,
          codigo:      dto.codigo,
          descripcion: dto.descripcion,
        },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'ubicaciones',
          registroId:    nueva.id,
          accion:        TipoAccionAuditoria.CREAR,
          datosNuevos:   { codigo: dto.codigo, nombre: dto.nombre, sedeId: dto.sedeId } as unknown as Prisma.InputJsonValue,
          usuarioId:     usuario.sub,
        },
      });

      return nueva;
    });

    this.logger.log(`[Catalogo] Ubicación creada: id=${ubicacion.id} codigo=${dto.codigo} por=${usuario.sub}`);
    return this.obtenerUbicacion(ubicacion.id);
  }

  async listarUbicaciones(query: ListarUbicacionesQueryDto): Promise<ListaPaginadaUbicaciones> {
    const pagina = query.pagina ?? 1;
    const limite = query.limite ?? 20;
    const saltar = (pagina - 1) * limite;

    const donde: Prisma.UbicacionWhereInput = {};
    if (query.busqueda) {
      donde.OR = [
        { nombre: { contains: query.busqueda, mode: 'insensitive' } },
        { codigo: { contains: query.busqueda, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined) donde.activo = query.activo;
    if (query.sedeId)               donde.sedeId = query.sedeId;

    const [registros, total] = await this.prisma.$transaction([
      this.prisma.ubicacion.findMany({
        where:   donde,
        skip:    saltar,
        take:    limite,
        orderBy: { nombre: 'asc' },
        include: { sede: { select: { id: true, nombre: true } } },
      }),
      this.prisma.ubicacion.count({ where: donde }),
    ]);

    const datos: UbicacionResumen[] = registros.map((u) => ({
      id:       u.id,
      sede:     { id: u.sede.id, nombre: u.sede.nombre },
      nombre:   u.nombre,
      codigo:   u.codigo,
      activo:   u.activo,
      creadoEn: u.creadoEn,
    }));

    return { datos, total, pagina, limite, totalPaginas: Math.ceil(total / limite) };
  }

  async obtenerUbicacion(id: string): Promise<UbicacionDetalle> {
    const ubicacion = await this.prisma.ubicacion.findUnique({
      where:   { id },
      include: { sede: { select: { id: true, nombre: true } } },
    });
    if (!ubicacion) throw new NotFoundException(`Ubicación ${id} no encontrada`);

    return {
      id:           ubicacion.id,
      sede:         { id: ubicacion.sede.id, nombre: ubicacion.sede.nombre },
      nombre:       ubicacion.nombre,
      codigo:       ubicacion.codigo,
      descripcion:  ubicacion.descripcion,
      activo:       ubicacion.activo,
      creadoEn:     ubicacion.creadoEn,
      actualizadoEn: ubicacion.actualizadoEn,
    };
  }

  // ===========================================================================
  // REFERENCIAS (solo lectura)
  // ===========================================================================

  async obtenerTiposItem(): Promise<Pick<TipoItem, 'id' | 'nombre' | 'descripcion' | 'comportamiento' | 'activo'>[]> {
    return this.prisma.tipoItem.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
      select:  { id: true, nombre: true, descripcion: true, comportamiento: true, activo: true },
    });
  }

  async obtenerSedes(): Promise<Pick<Sede, 'id' | 'nombre' | 'codigo' | 'direccion'>[]> {
    return this.prisma.sede.findMany({
      where:   { activo: true },
      orderBy: { nombre: 'asc' },
      select:  { id: true, nombre: true, codigo: true, direccion: true },
    });
  }

  async actualizarUbicacion(id: string, dto: ActualizarUbicacionDto, usuario: UsuarioJwt): Promise<UbicacionDetalle> {
    const actual = await this.prisma.ubicacion.findUnique({
      where:  { id },
      select: { id: true, codigo: true },
    });
    if (!actual) throw new NotFoundException(`Ubicación ${id} no encontrada`);

    if (dto.codigo && dto.codigo !== actual.codigo) {
      const duplicado = await this.prisma.ubicacion.findFirst({
        where: { codigo: dto.codigo, id: { not: id } },
        select: { id: true },
      });
      if (duplicado) throw new ConflictException(`Ya existe una ubicación con código ${dto.codigo}`);
    }

    if (dto.sedeId) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: dto.sedeId },
        select: { id: true, activo: true },
      });
      if (!sede || !sede.activo) throw new NotFoundException(`Sede ${dto.sedeId} no encontrada o inactiva`);
    }

    await this.prisma.ubicacion.update({
      where: { id },
      data:  {
        sedeId:      dto.sedeId,
        nombre:      dto.nombre,
        codigo:      dto.codigo,
        descripcion: dto.descripcion,
        activo:      dto.activo,
      },
    });

    this.logger.log(`[Catalogo] Ubicación actualizada: id=${id} por=${usuario.sub}`);
    return this.obtenerUbicacion(id);
  }
}
