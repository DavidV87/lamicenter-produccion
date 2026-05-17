import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TipoAccionAuditoria } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaServicio } from '../../../prisma/prisma.servicio';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UsuarioJwt } from './types/usuario-jwt.interfaz';

export interface DatosLoginRespuesta {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rolId: string;
    rol: string;
    sedeId: string;
    permisos: string[];
  };
}

@Injectable()
export class AuthServicio {
  constructor(
    private readonly prisma: PrismaServicio,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Valida credenciales, verifica que usuario y rol estén activos,
   * genera par de tokens y registra ultimoAcceso.
   */
  async login(
    dto: LoginDto,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<DatosLoginRespuesta> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
      include: { rol: { select: { nombre: true, activo: true } } },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!usuario.rol.activo) {
      throw new UnauthorizedException('El rol asignado no está activo');
    }

    const passwordValida = await bcrypt.compare(dto.password, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const permisos = await this._cargarPermisos(usuario.rolId);
    const payload: UsuarioJwt = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      rol: usuario.rol.nombre,
      sedeId: usuario.sedeId,
      permisos,
    };

    const tokens = this._generarTokens(payload);

    // ultimoAcceso no es operación crítica — no requiere transacción ni auditoría
    await this.prisma.usuario.update({
      where: { id: usuario.id },
      data: { ultimoAcceso: new Date() },
    });

    void ipOrigen;
    void userAgent;

    return {
      ...tokens,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rolId: usuario.rolId,
        rol: usuario.rol.nombre,
        sedeId: usuario.sedeId,
        permisos,
      },
    };
  }

  /**
   * Verifica el refresh token con el secreto específico de refresh,
   * recarga el usuario y sus permisos frescos desde BD y emite nuevos tokens.
   * Permisos se recargan aquí para reflejar cambios de rol sin relogin.
   */
  async refresh(dto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: UsuarioJwt;
    try {
      payload = this.jwtService.verify<UsuarioJwt>(dto.refreshToken, {
        secret: this.configService.get<string>('aplicacion.jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.sub },
      include: { rol: { select: { nombre: true, activo: true } } },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no disponible');
    }
    if (!usuario.rol.activo) {
      throw new UnauthorizedException('El rol asignado no está activo');
    }

    const permisos = await this._cargarPermisos(usuario.rolId);
    const nuevoPayload: UsuarioJwt = {
      sub: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      rol: usuario.rol.nombre,
      sedeId: usuario.sedeId,
      permisos,
    };

    return this._generarTokens(nuevoPayload);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   * Operación crítica: actualización de usuario + registro de auditoría en transacción.
   * NUNCA almacena ni registra el hash real en auditoría — solo marca redactado.
   */
  async cambiarPassword(
    usuarioId: string,
    dto: CambiarPasswordDto,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, passwordHash: true, activo: true },
    });

    if (!usuario || !usuario.activo) {
      throw new UnauthorizedException('Usuario no disponible');
    }

    const passwordValida = await bcrypt.compare(dto.passwordActual, usuario.passwordHash);
    if (!passwordValida) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    const saltRounds =
      this.configService.get<number>('aplicacion.jwt.bcryptSaltRounds') ?? 12;
    const nuevoHash = await bcrypt.hash(dto.passwordNuevo, saltRounds);

    await this.prisma.ejecutarTransaccion(async (tx) => {
      await tx.usuario.update({
        where: { id: usuarioId },
        data: { passwordHash: nuevoHash },
      });

      await tx.auditoriaGeneral.create({
        data: {
          tablaAfectada: 'usuarios',
          registroId: usuarioId,
          accion: TipoAccionAuditoria.ACTUALIZAR,
          datosAnteriores: { passwordHash: '[REDACTADO]' },
          datosNuevos: { passwordHash: '[REDACTADO]' },
          metadata: { motivo: 'Cambio de contraseña por usuario' },
          usuarioId,
          ipOrigen: ipOrigen ?? null,
          userAgent: userAgent ?? null,
        },
      });
    });
  }

  /**
   * Devuelve todos los usuarios activos con su rol para poblar selects en el frontend.
   * No incluye datos sensibles (passwordHash, refreshToken, etc.).
   */
  async listarUsuariosActivos(): Promise<
    { id: string; nombre: string; email: string; rolId: string; rol: { nombre: string }; sedeId: string }[]
  > {
    return this.prisma.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        email: true,
        rolId: true,
        rol: { select: { nombre: true } },
        sedeId: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  private async _cargarPermisos(rolId: string): Promise<string[]> {
    const rolesPermisos = await this.prisma.rolPermiso.findMany({
      where: { rolId, permiso: { activo: true } },
      include: { permiso: { select: { codigo: true } } },
    });
    return rolesPermisos.map((rp) => rp.permiso.codigo);
  }

  private _generarTokens(payload: UsuarioJwt): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwtService.sign(payload);
    // @nestjs/jwt v11 usa StringValue (branded string de ms) — cast requerido para expiresIn
    const refreshExpiresIn = (this.configService.get<string>('aplicacion.jwt.refreshExpiresIn') ||
      '7d') as unknown as number;
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('aplicacion.jwt.refreshSecret'),
      expiresIn: refreshExpiresIn,
    });
    return { accessToken, refreshToken };
  }
}
