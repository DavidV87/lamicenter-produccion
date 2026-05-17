import type { EstadoResumen } from '../types/abastecimiento.types';

const COLORES: Record<string, string> = {
  pendiente:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  en_revision: 'bg-blue-100 text-blue-800 border-blue-300',
  aprobado:    'bg-green-100 text-green-800 border-green-300',
  aprobada:    'bg-green-100 text-green-800 border-green-300',
  rechazado:   'bg-red-100 text-red-800 border-red-300',
  rechazada:   'bg-red-100 text-red-800 border-red-300',
  atendido:    'bg-emerald-100 text-emerald-800 border-emerald-300',
  enviada:     'bg-indigo-100 text-indigo-800 border-indigo-300',
  cancelado:   'bg-gray-100 text-gray-600 border-gray-300',
  cancelada:   'bg-gray-100 text-gray-600 border-gray-300',
  borrador:    'bg-gray-100 text-gray-500 border-gray-200',
};

interface Props {
  estado: EstadoResumen;
}

export function EstadoAbastecimientoBadge({ estado }: Props) {
  const clases = COLORES[estado.codigo] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${clases}`}>
      {estado.nombre}
    </span>
  );
}
