import type { EstadoResumen } from '../types/produccion.types';

interface Props {
  estado: EstadoResumen;
}

const COLORES: Record<string, string> = {
  borrador:        'bg-gray-100 text-gray-700',
  validada:        'bg-blue-100 text-blue-800',
  en_cola:         'bg-yellow-100 text-yellow-800',
  en_corte:        'bg-orange-100 text-orange-800',
  corte_terminado: 'bg-amber-100 text-amber-800',
  en_enchape:      'bg-purple-100 text-purple-800',
  terminada:       'bg-[#636620]/10 text-[#636620]',
  cancelada:       'bg-[#B11917]/10 text-[#B11917]',
};

export function OrdenEstadoBadge({ estado }: Props) {
  const clase = COLORES[estado.codigo] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${clase}`}>
      {estado.nombre}
    </span>
  );
}
