import { Package, Factory, Truck, MessageSquare, Clock } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { ActividadReciente, TipoActividad } from '@/shared/types';

const CONFIG_TIPO: Record<
  TipoActividad,
  { Icono: React.ElementType; etiqueta: string; dot: string; badge: string }
> = {
  pedido: {
    Icono:    Package,
    etiqueta: 'Pedido',
    dot:      'bg-marca-primario',
    badge:    'bg-marca-primario/10 text-marca-primario border-marca-primario/20',
  },
  produccion: {
    Icono:    Factory,
    etiqueta: 'Producción',
    dot:      'bg-emerald-600',
    badge:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  despacho: {
    Icono:    Truck,
    etiqueta: 'Despacho',
    dot:      'bg-blue-600',
    badge:    'bg-blue-50 text-blue-700 border-blue-200',
  },
  pqrs: {
    Icono:    MessageSquare,
    etiqueta: 'PQRS',
    dot:      'bg-marca-rojo',
    badge:    'bg-marca-rojo/10 text-marca-rojo border-marca-rojo/20',
  },
};

function horasRelativas(fechaStr: string): string {
  const diff     = Date.now() - new Date(fechaStr).getTime();
  const minutos  = Math.floor(diff / 60_000);
  if (minutos < 1)  return 'Ahora';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24)   return `${horas} h`;
  return `${Math.floor(horas / 24)} d`;
}

interface Props {
  items?:   ActividadReciente[];
  cargando: boolean;
}

export function ListaActividadReciente({ items, cargando }: Props) {
  return (
    <div className="rounded-lg border border-marca-gris/50 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-marca-gris/40 px-5 py-4">
        <Clock size={15} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold text-marca-negro">Actividad reciente</h2>
      </div>

      {/* Banda dorada */}
      <div className="h-0.5 bg-marca-dorado/50" />

      {/* Contenido */}
      {cargando || !items ? (
        <div className="divide-y divide-marca-gris/20">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-3.5">
              <Skeleton className="h-2 w-2 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-56" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-3 w-10 shrink-0" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          Sin actividad reciente registrada
        </p>
      ) : (
        <ul className="divide-y divide-marca-gris/20">
          {items.map((item) => {
            const cfg  = CONFIG_TIPO[item.tipo];
            const Icono = cfg.Icono;
            const key  = `${item.tipo}-${item.entidadId}-${item.fecha}`;
            return (
              <li key={key} className="flex items-start gap-4 px-5 py-3.5 hover:bg-background transition-colors">
                {/* Ícono tipo */}
                <div className={`mt-1 shrink-0 flex h-7 w-7 items-center justify-center rounded-full ${cfg.badge} border`}>
                  <Icono size={13} />
                </div>

                {/* Descripción */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground leading-snug">{item.descripcion}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0 text-[10px] font-semibold uppercase tracking-wide ${cfg.badge}`}>
                      {cfg.etiqueta}
                    </span>
                    {item.usuario && (
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {item.usuario}
                      </span>
                    )}
                  </div>
                </div>

                {/* Tiempo relativo */}
                <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                  {horasRelativas(item.fecha)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
