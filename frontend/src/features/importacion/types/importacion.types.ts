export type TipoIdentificacion = 'NIT' | 'CC' | 'CE' | 'PAS' | 'OTRO';

// Estado de cada fila tras previsualización
export type EstadoFila = 'valido' | 'duplicado_archivo' | 'duplicado_bd' | 'error';

// Datos de una fila de cliente normalizada desde Excel
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

// Resultado de previsualización por fila
export interface FilaPreviewCliente {
  indice: number;
  datos: Record<string, unknown>;
  estado: EstadoFila;
  errores: string[];
}

// Respuesta del endpoint previsualizar
export interface ResumenPreviewClientes {
  total: number;
  validos: number;
  duplicadosArchivo: number;
  duplicadosBd: number;
  errores: number;
  filas: FilaPreviewCliente[];
}

// Respuesta del endpoint confirmar
export interface ResultadoImportacionClientes {
  creados: number;
  omitidos: number;
  errores: number;
}
