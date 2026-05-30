import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import type {
  FilaClienteEntrada,
  ResumenPreviewClientes,
  ResultadoImportacionClientes,
} from '../types/importacion.types';

export const importacionServicio = {
  async previsualizarClientes(filas: FilaClienteEntrada[]): Promise<ResumenPreviewClientes> {
    const { data } = await clienteApi.post<RespuestaApi<ResumenPreviewClientes>>(
      '/importacion/clientes/previsualizar',
      { filas },
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },

  async confirmarImportacionClientes(filas: FilaClienteEntrada[]): Promise<ResultadoImportacionClientes> {
    const { data } = await clienteApi.post<RespuestaApi<ResultadoImportacionClientes>>(
      '/importacion/clientes/confirmar',
      { filas },
    );
    if (!data.exito || !data.datos) throw new Error(data.mensaje);
    return data.datos;
  },
};
