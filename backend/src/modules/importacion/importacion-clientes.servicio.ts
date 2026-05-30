import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TipoAccionAuditoria } from '@prisma/client';
import { PrismaServicio } from '../../prisma/prisma.servicio';
import { UsuarioJwt } from '../seguridad/auth/types/usuario-jwt.interfaz';
import { PrevisualizarClientesDto } from './dto/previsualizar-clientes.dto';
import { ConfirmarImportacionClientesDto } from './dto/confirmar-importacion-clientes.dto';
import {
  EstadoFila,
  FilaPreviewCliente,
  ResumenPreviewClientes,
  ResultadoConfirmarClientes,
} from './interfaces/importacion.interfaces';

const TIPOS_IDENTIFICACION_VALIDOS = ['NIT', 'CC', 'CE', 'PAS', 'OTRO'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ImportacionClientesServicio {
  private readonly logger = new Logger(ImportacionClientesServicio.name);

  constructor(private readonly prisma: PrismaServicio) {}

  /**
   * Previsualiza un lote de filas de clientes desde Excel.
   * Clasifica cada fila en: valido, duplicado_archivo, duplicado_bd, o error.
   * No escribe nada en la base de datos.
   */
  async previsualizar(dto: PrevisualizarClientesDto): Promise<ResumenPreviewClientes> {
    const { filas } = dto;

    // Paso 1: validar cada fila individualmente y construir el mapa de identificaciones
    const resultado: FilaPreviewCliente[] = [];
    const mapaIdentificaciones = new Map<string, number[]>(); // identificacion → [índices]

    for (let i = 0; i < filas.length; i++) {
      const fila = filas[i];
      const errores = this._validarFila(fila);

      const identificacion = this._normalizarTexto(fila.identificacion);
      if (identificacion) {
        const indices = mapaIdentificaciones.get(identificacion) ?? [];
        indices.push(i);
        mapaIdentificaciones.set(identificacion, indices);
      }

      resultado.push({
        indice: i,
        datos: fila,
        estado: errores.length > 0 ? 'error' : 'valido',
        errores,
      });
    }

    // Paso 2: marcar duplicados dentro del archivo (mismo identificacion en más de una fila)
    for (const [identificacion, indices] of mapaIdentificaciones) {
      if (indices.length > 1) {
        for (const idx of indices) {
          if (resultado[idx].estado === 'valido') {
            resultado[idx].estado = 'duplicado_archivo';
            resultado[idx].errores = [
              `Identificación "${identificacion}" aparece en ${indices.length} filas del archivo (filas ${indices.map((i) => i + 2).join(', ')})`,
            ];
          }
        }
      }
    }

    // Paso 3: consultar BD por identificaciones válidas para detectar clientes ya existentes
    const identificacionesValidas = resultado
      .filter((r) => r.estado === 'valido')
      .map((r) => this._normalizarTexto(filas[r.indice].identificacion))
      .filter(Boolean) as string[];

    if (identificacionesValidas.length > 0) {
      const existentesEnBd = await this.prisma.cliente.findMany({
        where: { identificacion: { in: identificacionesValidas } },
        select: { identificacion: true },
      });
      const existenteSet = new Set(existentesEnBd.map((e) => e.identificacion));

      for (const item of resultado) {
        if (item.estado === 'valido') {
          const id = this._normalizarTexto(filas[item.indice].identificacion);
          if (id && existenteSet.has(id)) {
            item.estado = 'duplicado_bd';
            item.errores = [`Cliente con identificación "${id}" ya existe en el sistema`];
          }
        }
      }
    }

    const conteos = this._contarEstados(resultado);
    this.logger.log(
      `[Importacion] Previsualización: total=${conteos.total} validos=${conteos.validos} ` +
        `dupArchivo=${conteos.duplicadosArchivo} dupBd=${conteos.duplicadosBd} errores=${conteos.errores}`,
    );

    return { ...conteos, filas: resultado };
  }

  /**
   * Confirma la importación de un lote de filas de clientes válidas.
   * Re-verifica existencia en BD para manejar condiciones de carrera.
   * Registra auditoría individual por cada cliente creado.
   */
  async confirmar(
    dto: ConfirmarImportacionClientesDto,
    usuario: UsuarioJwt,
  ): Promise<ResultadoConfirmarClientes> {
    const { filas } = dto;

    // Re-verificar existencia en BD (protección contra condiciones de carrera entre previsualizar y confirmar)
    const identificaciones = filas.map((f) => f.identificacion);
    const existentes = await this.prisma.cliente.findMany({
      where: { identificacion: { in: identificaciones } },
      select: { identificacion: true },
    });
    const existenteSet = new Set(existentes.map((e) => e.identificacion));

    const filasNuevas = filas.filter((f) => !existenteSet.has(f.identificacion));
    const omitidos = filas.length - filasNuevas.length;

    if (filasNuevas.length === 0) {
      this.logger.log(
        `[Importacion] Confirmar clientes: creados=0 omitidos=${omitidos} (todos ya existían)`,
      );
      return { creados: 0, omitidos, errores: 0 };
    }

    // Insertar todos los nuevos en una sola transacción con auditoría individual
    await this.prisma.ejecutarTransaccion(async (tx) => {
      for (const fila of filasNuevas) {
        const nuevo = await tx.cliente.create({
          data: {
            razonSocial:        fila.razonSocial,
            identificacion:     fila.identificacion,
            tipoIdentificacion: fila.tipoIdentificacion,
            nombreComercial:    fila.nombreComercial ?? undefined,
            telefono:           fila.telefono ?? undefined,
            correo:             fila.correo ?? undefined,
            direccion:          fila.direccion ?? undefined,
            ciudad:             fila.ciudad ?? undefined,
          },
        });

        await tx.auditoriaGeneral.create({
          data: {
            tablaAfectada: 'clientes',
            registroId:    nuevo.id,
            accion:        TipoAccionAuditoria.CREAR,
            datosNuevos:   {
              razonSocial:    fila.razonSocial,
              identificacion: fila.identificacion,
            } as unknown as Prisma.InputJsonValue,
            metadata: {
              fuente:    'importacion_excel',
              loteTamano: filasNuevas.length,
            } as unknown as Prisma.InputJsonValue,
            usuarioId: usuario.sub,
          },
        });
      }
    });

    this.logger.log(
      `[Importacion] Confirmar clientes: creados=${filasNuevas.length} omitidos=${omitidos} usuario=${usuario.sub}`,
    );

    return { creados: filasNuevas.length, omitidos, errores: 0 };
  }

  // ── Helpers privados ──────────────────────────────────────────────────────────

  private _validarFila(fila: Record<string, unknown>): string[] {
    const errores: string[] = [];

    // razonSocial
    const razonSocial = this._normalizarTexto(fila.razonSocial);
    if (!razonSocial) {
      errores.push('razonSocial es requerido');
    } else if (razonSocial.length > 200) {
      errores.push('razonSocial excede 200 caracteres');
    }

    // identificacion
    const identificacion = this._normalizarTexto(fila.identificacion);
    if (!identificacion) {
      errores.push('identificacion es requerida');
    } else if (identificacion.length > 30) {
      errores.push('identificacion excede 30 caracteres');
    }

    // tipoIdentificacion
    const tipoId = this._normalizarTexto(fila.tipoIdentificacion);
    if (!tipoId || !TIPOS_IDENTIFICACION_VALIDOS.includes(tipoId)) {
      errores.push(
        `tipoIdentificacion inválido. Valores aceptados: ${TIPOS_IDENTIFICACION_VALIDOS.join(', ')}`,
      );
    }

    // correo (opcional, pero si viene debe tener formato válido)
    const correo = this._normalizarTexto(fila.correo);
    if (correo && !EMAIL_REGEX.test(correo)) {
      errores.push('correo no tiene formato válido');
    }

    return errores;
  }

  private _normalizarTexto(valor: unknown): string {
    if (valor === null || valor === undefined) return '';
    return String(valor).trim();
  }

  private _contarEstados(filas: FilaPreviewCliente[]): {
    total: number;
    validos: number;
    duplicadosArchivo: number;
    duplicadosBd: number;
    errores: number;
  } {
    const conteo: Record<EstadoFila, number> = {
      valido:            0,
      duplicado_archivo: 0,
      duplicado_bd:      0,
      error:             0,
    };
    for (const f of filas) conteo[f.estado]++;
    return {
      total:             filas.length,
      validos:           conteo.valido,
      duplicadosArchivo: conteo.duplicado_archivo,
      duplicadosBd:      conteo.duplicado_bd,
      errores:           conteo.error,
    };
  }
}
