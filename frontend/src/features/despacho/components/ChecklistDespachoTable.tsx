import { CheckCircle2, XCircle } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { ChecklistDespacho } from '../types/despacho.types';

interface Props {
  checklist: ChecklistDespacho | null | undefined;
  cargando: boolean;
}

export function ChecklistDespachoTable({ checklist, cargando }: Props) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!checklist) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No hay checklist registrado para este despacho.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Estado del checklist:</span>
        {checklist.completado
          ? <span className="font-medium text-green-700">Completado</span>
          : <span className="font-medium text-yellow-700">Pendiente</span>}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Validación</th>
              <th className="px-4 py-2 text-center font-medium text-muted-foreground">Cumple</th>
              <th className="px-4 py-2 text-left font-medium text-muted-foreground">Observaciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {checklist.items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30">
                <td className="px-4 py-2">{item.tipoValidacionDespacho.nombre}</td>
                <td className="px-4 py-2 text-center">
                  {item.cumple
                    ? <CheckCircle2 size={16} className="mx-auto text-green-600" />
                    : <XCircle size={16} className="mx-auto text-red-500" />}
                </td>
                <td className="px-4 py-2 text-muted-foreground">{item.observaciones ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {checklist.observaciones && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Obs. generales:</span> {checklist.observaciones}
        </p>
      )}
    </div>
  );
}
