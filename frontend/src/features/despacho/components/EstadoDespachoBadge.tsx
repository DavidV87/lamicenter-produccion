interface Props {
  codigo: string;
  nombre: string;
}

const COLORES: Record<string, string> = {
  pendiente:       'bg-yellow-100 text-yellow-800 border-yellow-300',
  en_transito:     'bg-blue-100 text-blue-800 border-blue-300',
  entregado:       'bg-green-100 text-green-800 border-green-300',
  cancelado:       'bg-gray-100 text-gray-600 border-gray-300',
  devuelto:        'bg-orange-100 text-orange-800 border-orange-300',
  en_preparacion:  'bg-indigo-100 text-indigo-800 border-indigo-300',
};

export function EstadoDespachoBadge({ codigo, nombre }: Props) {
  const clases = COLORES[codigo] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${clases}`}>
      {nombre}
    </span>
  );
}
