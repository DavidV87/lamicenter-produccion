import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { TipoAccionAuditoria } from '@prisma/client';
import { UsuarioJwt } from '../../modules/seguridad/auth/types/usuario-jwt.interfaz';
import { AuditoriaServicio } from '../services/auditoria.servicio';
import { NO_AUDITAR_KEY } from '../decorators/no-auditar.decorator';
import { AUDITAR_KEY, OpcionesAuditar } from '../decorators/auditar.decorator';
import { ContextoAuditoria } from '../interfaces/contexto-auditoria.interface';

// ---------------------------------------------------------------
// Rutas excluidas por defecto — sin @NoAuditar() necesario
// ---------------------------------------------------------------
const RUTAS_EXCLUIDAS_SUFIJOS = ['/health', '/favicon.ico'];

// ---------------------------------------------------------------
// Campos que NUNCA se deben persistir en auditoría.
// Incluye variantes en español por convención del proyecto.
// ---------------------------------------------------------------
const CAMPOS_SENSIBLES = new Set([
  'password',
  'passwordActual',
  'passwordNuevo',
  'passwordConfirmacion',
  'contrasena',
  'contrasenaActual',
  'refreshToken',
  'accessToken',
  'token',
  'secret',
  'apiKey',
  'authorization',
  'hash',
  'passwordHash',
]);

// Extiende Request de Express para incluir campos que agrega el sistema
type SolicitudEnriquecida = Request & {
  user?: UsuarioJwt;
  /**
   * Los servicios pueden inyectar aquí contexto adicional antes de que el
   * interceptor escriba el registro de auditoría.
   *
   * Ejemplo en un servicio:
   *   (req as SolicitudEnriquecida).auditoriaContexto = { entidadId: pedido.id };
   */
  auditoriaContexto?: ContextoAuditoria;
};

interface ParametrosRegistro {
  solicitud: SolicitudEnriquecida;
  opcionesAuditar?: OpcionesAuditar;
  metodo: string;
  rutaPlantilla: string;
  urlCompleta: string;
  ip: string;
  userAgent?: string;
  statusCode: number;
  duracionMs: number;
  bodyParaAuditoria?: Record<string, unknown>;
  errorMensaje: string | null;
}

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(
    private readonly auditoriaServicio: AuditoriaServicio,
    private readonly reflector: Reflector,
  ) {}

  intercept(contexto: ExecutionContext, siguiente: CallHandler): Observable<unknown> {
    // Solo aplica a solicitudes HTTP
    if (contexto.getType() !== 'http') {
      return siguiente.handle();
    }

    const http = contexto.switchToHttp();
    const solicitud = http.getRequest<SolicitudEnriquecida>();
    const respuesta = http.getResponse<Response>();

    // Leer metadata de @Auditar() (handler tiene precedencia sobre clase)
    const opcionesAuditar = this.reflector.getAllAndOverride<OpcionesAuditar | undefined>(
      AUDITAR_KEY,
      [contexto.getHandler(), contexto.getClass()],
    );

    if (this._debeExcluir(contexto, solicitud, opcionesAuditar)) {
      return siguiente.handle();
    }

    const inicio = Date.now();
    const metodo = solicitud.method.toUpperCase();
    // route.path es la plantilla (/pedidos/:id); url es la URL real (/api/v1/pedidos/123)
    const rutaPlantilla = (solicitud.route?.path as string | undefined) ?? solicitud.path;
    const urlCompleta = solicitud.url;
    const ip = this._extraerIp(solicitud);
    const userAgent = solicitud.headers['user-agent'];

    // El body solo es relevante para operaciones de escritura
    const bodyParaAuditoria = ['POST', 'PUT', 'PATCH'].includes(metodo)
      ? this._sanitizarObjeto(solicitud.body as unknown)
      : undefined;

    return siguiente.handle().pipe(
      tap(() => {
        const duracionMs = Date.now() - inicio;
        // fire-and-forget: auditoría no bloquea la respuesta
        void this._registrar({
          solicitud,
          opcionesAuditar,
          metodo,
          rutaPlantilla,
          urlCompleta,
          ip,
          userAgent,
          statusCode: respuesta.statusCode,
          duracionMs,
          bodyParaAuditoria,
          errorMensaje: null,
        });
      }),
      catchError((error: unknown) => {
        const duracionMs = Date.now() - inicio;
        const statusCode =
          error instanceof HttpException ? error.getStatus() : 500;

        void this._registrar({
          solicitud,
          opcionesAuditar,
          metodo,
          rutaPlantilla,
          urlCompleta,
          ip,
          userAgent,
          statusCode,
          duracionMs,
          bodyParaAuditoria,
          errorMensaje: (error as Error)?.message ?? 'Error desconocido',
        });

        // Re-lanzar para que FiltroExcepcionesGlobal lo procese normalmente
        return throwError(() => error);
      }),
    );
  }

  // ---------------------------------------------------------------
  // Lógica de exclusión
  // ---------------------------------------------------------------

  private _debeExcluir(
    contexto: ExecutionContext,
    solicitud: Request,
    opcionesAuditar?: OpcionesAuditar,
  ): boolean {
    // @NoAuditar() tiene prioridad absoluta
    const noAuditar = this.reflector.getAllAndOverride<boolean>(NO_AUDITAR_KEY, [
      contexto.getHandler(),
      contexto.getClass(),
    ]);
    if (noAuditar) return true;

    // Rutas excluidas por configuración global
    const rutaActual = solicitud.path ?? '';
    const esRutaExcluida = RUTAS_EXCLUIDAS_SUFIJOS.some(
      (sufijo) => rutaActual === sufijo || rutaActual.endsWith(sufijo),
    );
    if (esRutaExcluida) return true;

    // GET y HEAD generan demasiado volumen si se auditan por defecto.
    // Solo se auditan cuando el endpoint tiene @Auditar() explícito.
    const metodo = solicitud.method.toUpperCase();
    if ((metodo === 'GET' || metodo === 'HEAD') && !opcionesAuditar) {
      return true;
    }

    return false;
  }

  // ---------------------------------------------------------------
  // Construcción y escritura del registro de auditoría
  // ---------------------------------------------------------------

  private async _registrar(params: ParametrosRegistro): Promise<void> {
    try {
      const {
        solicitud,
        opcionesAuditar,
        metodo,
        rutaPlantilla,
        urlCompleta,
        ip,
        userAgent,
        statusCode,
        duracionMs,
        bodyParaAuditoria,
        errorMensaje,
      } = params;

      const usuario = solicitud.user;
      const contextoEnriquecido = solicitud.auditoriaContexto;

      // Prioridad: @Auditar({entidad}) > req.auditoriaContexto.entidad > inferencia desde ruta
      const tablaAfectada =
        opcionesAuditar?.entidad ??
        contextoEnriquecido?.entidad ??
        this._inferirTabla(rutaPlantilla);

      // registroId solo disponible si el servicio lo inyecta en auditoriaContexto
      const registroId = contextoEnriquecido?.entidadId;

      const accion = this._inferirAccion(
        metodo,
        opcionesAuditar?.accion ?? contextoEnriquecido?.accion,
      );

      const metadata: Record<string, unknown> = {
        metodo,
        ruta: urlCompleta,
        statusCode,
        duracionMs,
      };

      if (solicitud.params && Object.keys(solicitud.params).length > 0) {
        metadata.params = solicitud.params;
      }
      if (solicitud.query && Object.keys(solicitud.query).length > 0) {
        metadata.query = solicitud.query;
      }
      if (errorMensaje) {
        metadata.error = errorMensaje;
      }
      // Metadata adicional inyectada por el servicio se fusiona al final
      if (contextoEnriquecido?.metadata) {
        Object.assign(metadata, contextoEnriquecido.metadata);
      }

      await this.auditoriaServicio.registrarAuditoria({
        tablaAfectada,
        registroId,
        accion,
        datosNuevos: bodyParaAuditoria ?? null,
        metadata,
        usuarioId: usuario?.sub ?? null,
        ipOrigen: ip,
        userAgent,
      });
    } catch {
      // Doble capa de seguridad: AuditoriaServicio ya captura errores,
      // pero este catch garantiza que ningún bug aquí rompa el request.
    }
  }

  // ---------------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------------

  /**
   * Mapea el método HTTP al tipo de acción del enum TipoAccionAuditoria.
   * La acción explícita (@Auditar o auditoriaContexto) siempre tiene precedencia.
   */
  private _inferirAccion(
    metodo: string,
    accionExplicita?: TipoAccionAuditoria,
  ): TipoAccionAuditoria {
    if (accionExplicita) return accionExplicita;

    switch (metodo) {
      case 'POST':
        return TipoAccionAuditoria.CREAR;
      case 'PUT':
      case 'PATCH':
        return TipoAccionAuditoria.ACTUALIZAR;
      case 'DELETE':
        return TipoAccionAuditoria.ELIMINAR;
      case 'GET':
      case 'HEAD':
        return TipoAccionAuditoria.CONSULTAR;
      default:
        return TipoAccionAuditoria.OTRO;
    }
  }

  /**
   * Extrae el nombre de la entidad desde la plantilla de ruta.
   * Ejemplos:
   *   /pedidos/:id          → pedidos
   *   /api/v1/auth/login    → auth
   *   /ordenes-produccion   → ordenes-produccion
   */
  private _inferirTabla(ruta: string): string {
    const segmentos = ruta
      .split('/')
      .filter((s) => s && s !== 'api' && !/^v\d+$/.test(s) && !s.startsWith(':'));
    return segmentos[0] ?? 'http_request';
  }

  /**
   * Extrae la IP real del cliente respetando proxies con X-Forwarded-For.
   */
  private _extraerIp(solicitud: Request): string {
    const forwarded = solicitud.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return solicitud.ip ?? solicitud.socket?.remoteAddress ?? 'desconocida';
  }

  /**
   * Elimina recursivamente campos sensibles del objeto antes de persistirlo.
   * Los campos en CAMPOS_SENSIBLES se reemplazan por '[REDACTADO]'.
   * Nunca lanza — si el input no es un objeto plano, retorna undefined.
   */
  private _sanitizarObjeto(obj: unknown): Record<string, unknown> | undefined {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return undefined;
    }

    const resultado: Record<string, unknown> = {};
    for (const [clave, valor] of Object.entries(obj as Record<string, unknown>)) {
      if (CAMPOS_SENSIBLES.has(clave)) {
        resultado[clave] = '[REDACTADO]';
      } else if (valor && typeof valor === 'object' && !Array.isArray(valor)) {
        resultado[clave] = this._sanitizarObjeto(valor);
      } else {
        resultado[clave] = valor;
      }
    }
    return resultado;
  }
}
