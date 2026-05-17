import { Skeleton } from '@/shared/components/ui/skeleton';
import type { SeguimientoPqrs } from '../types/pqrs.types';

const ETIQUETA_TIPO: Record<string, string> = {
  CREACION:     'Creación',
  ASIGNACION:   'Asignación',
  ACTUALIZACION: 'Actualización',
  SOLUCION:     'Solución',
  CIERRE:       'Cierre',
  REAPERTURA:   'Reapertura',
  ANULACION:    'Anulación',
};

const COLOR_TIPO: Record<string, string> = {
  CREACION:     'bg-blue-500',
  ASIGNACION:   'bg-indigo-500',
  ACTUALIZACION: 'bg-yellow-500',
  SOLUCION:     'bg-green-500',
  CIERRE:       'bg-emerald-600',
  REAPERTURA:   'bg-orange-500',
  ANULACION:    'bg-gray-400',
};

interface Props {
  seguimientos: SeguimientoPqrs[] | undefined;
  cargando: boolean;
}

export function SeguimientosTimeline({ seguimientos, cargando }: Props) {
  if (cargando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!seguimientos?.length) {
    return (
      <p className="py-4 text-sm text-muted-foreground">Sin seguimientos registrados.</p>
    );
  }

  return (
    <ol className="relative border-l border-muted ml-3 space-y-4">
      {seguimientos.map((s) => (
        <li key={s.id} className="ml-5">
          <span className={`absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full ${COLOR_TIPO[s.tipoSeguimiento] ?? 'bg-gray-400'}`} />
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {ETIQUETA_TIPO[s.tipoSeguimiento] ?? s.tipoSeguimiento}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(s.creadoEn).toLocaleDateString('es-CO', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-sm">{s.descripcion}</p>
            {s.observaciones && (
              <p className="mt-1 text-xs text-muted-foreground">{s.observaciones}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">— {s.creadoPor.nombre}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
