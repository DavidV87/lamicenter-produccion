import { TipoIdentificacion } from '@prisma/client';

// Datos de una fila de cliente proveniente del Excel (ya normalizados por el frontend)
export interface FilaClienteEntrada {
  razonSocial: string;
  identificacion: string;
  tipoIdentificacion: TipoIdentificacion;
  nombreComercial?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  ciudad?: string;
}

// Estado de una fila tras el proceso de previsualización
export type EstadoFila = 'valido' | 'duplicado_archivo' | 'duplicado_bd' | 'error';

// Resultado de previsualización por fila
export interface FilaPreviewCliente {
  indice: number;
  datos: Record<string, unknown>;
  estado: EstadoFila;
  errores: string[];
}

// Respuesta completa del endpoint previsualizar
export interface ResumenPreviewClientes {
  total: number;
  validos: number;
  duplicadosArchivo: number;
  duplicadosBd: number;
  errores: number;
  filas: FilaPreviewCliente[];
}

// Respuesta del endpoint confirmar
export interface ResultadoConfirmarClientes {
  creados: number;
  omitidos: number;
  errores: number;
}
