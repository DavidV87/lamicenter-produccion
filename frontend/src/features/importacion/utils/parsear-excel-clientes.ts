import * as XLSX from 'xlsx';
import type { FilaClienteEntrada, TipoIdentificacion } from '../types/importacion.types';

const TIPOS_VALIDOS: TipoIdentificacion[] = ['NIT', 'CC', 'CE', 'PAS', 'OTRO'];

function str(val: unknown): string {
  if (val === null || val === undefined) return '';
  return String(val).trim();
}

/**
 * Lee un archivo .xlsx y extrae las filas como FilaClienteEntrada[].
 * Acepta columnas en snake_case (razon_social) o camelCase (razonSocial).
 * Retorna las filas sin validar: la validación detallada ocurre en el backend.
 */
export function parsearExcelClientes(archivo: File): Promise<FilaClienteEntrada[]> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = (e) => {
      try {
        const datos = e.target?.result;
        const libro = XLSX.read(datos, { type: 'binary' });
        const nombreHoja = libro.SheetNames[0];
        const hoja = libro.Sheets[nombreHoja];
        const filas = XLSX.utils.sheet_to_json<Record<string, unknown>>(hoja, {
          defval: '',
          raw: false,
        });

        const resultado: FilaClienteEntrada[] = filas.map((fila) => {
          const tipoRaw = str(fila.tipo_identificacion ?? fila.tipoIdentificacion).toUpperCase() as TipoIdentificacion;
          return {
            razonSocial:        str(fila.razon_social ?? fila.razonSocial),
            identificacion:     str(fila.identificacion),
            tipoIdentificacion: TIPOS_VALIDOS.includes(tipoRaw) ? tipoRaw : tipoRaw,
            nombreComercial:    str(fila.nombre_comercial ?? fila.nombreComercial) || undefined,
            telefono:           str(fila.telefono) || undefined,
            correo:             str(fila.correo) || undefined,
            direccion:          str(fila.direccion) || undefined,
            ciudad:             str(fila.ciudad) || undefined,
          };
        });

        resolve(resultado);
      } catch {
        reject(new Error('No se pudo leer el archivo Excel. Verifique el formato.'));
      }
    };

    lector.onerror = () => reject(new Error('Error al leer el archivo'));
    lector.readAsBinaryString(archivo);
  });
}
