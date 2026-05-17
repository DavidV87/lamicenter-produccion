interface Props {
  codigo: string;
  nombre: string;
}

const COLORES: Record<string, string> = {
  pendiente:    'bg-yellow-100 text-yellow-800 border-yellow-300',
  en_revision:  'bg-blue-100 text-blue-800 border-blue-300',
  en_proceso:   'bg-indigo-100 text-indigo-800 border-indigo-300',
  solucionada:  'bg-green-100 text-green-800 border-green-300',
  cerrada:      'bg-emerald-100 text-emerald-800 border-emerald-300',
  rechazada:    'bg-red-100 text-red-800 border-red-300',
  anulada:      'bg-gray-100 text-gray-600 border-gray-300',
};

export function EstadoPqrsBadge({ codigo, nombre }: Props) {
  const clases = COLORES[codigo] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${clases}`}>
      {nombre}
    </span>
  );
}
