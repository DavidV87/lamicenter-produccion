import { AlertTriangle } from 'lucide-react';

interface Props {
  advertencias: string[];
}

export function AdvertenciaDuplicadoAlert({ advertencias }: Props) {
  if (!advertencias.length) return null;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
      <AlertTriangle size={18} className="mt-0.5 shrink-0 text-yellow-600" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-yellow-800">
          {advertencias.length === 1
            ? 'Advertencia al crear la PQRS'
            : `${advertencias.length} advertencias al crear la PQRS`}
        </p>
        <ul className="list-disc pl-4 space-y-0.5">
          {advertencias.map((a, i) => (
            <li key={i} className="text-sm text-yellow-700">{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
