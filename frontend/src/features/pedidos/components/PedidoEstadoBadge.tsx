import type { EstadoResumen } from '../types/pedidos.types';

interface Props {
  estado: EstadoResumen;
}

const COLORES_CODIGO: Record<string, string> = {
  borrador:       'bg-gray-100 text-gray-700',
  en_revision:    'bg-yellow-100 text-yellow-800',
  validado:       'bg-blue-100 text-blue-800',
  en_produccion:  'bg-[#636620]/10 text-[#636620]',
  listo_despacho: 'bg-emerald-100 text-emerald-800',
  despachado:     'bg-emerald-700 text-white',
  cancelado:      'bg-[#B11917]/10 text-[#B11917]',
};

export function PedidoEstadoBadge({ estado }: Props) {
  const clase = COLORES_CODIGO[estado.codigo] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${clase}`}>
      {estado.nombre}
    </span>
  );
}
