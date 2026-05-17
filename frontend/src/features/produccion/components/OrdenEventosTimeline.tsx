import { Activity } from 'lucide-react';
import { useEventosOrden } from '../hooks/useProduccion';
import type { TipoEvento } from '../types/produccion.types';

interface Props {
  ordenId: string;
}

const ETIQUETA_EVENTO: Record<TipoEvento, string> = {
  INICIO_ETAPA:      'Inicio de etapa',
  FIN_ETAPA:         'Fin de etapa',
  NOVEDAD:           'Novedad',
  REPROCESO:         'Reproceso',
  CAMBIO_PRIORIDAD:  'Cambio de prioridad',
  ASIGNACION_MAQUINA: 'Asignación de máquina',
  AUTORIZACION:      'Autorización',
  PAUSA:             'Pausa',
};

const COLOR_EVENTO: Record<TipoEvento, string> = {
  INICIO_ETAPA:      'bg-[#636620]/10 text-[#636620]',
  FIN_ETAPA:         'bg-emerald-100 text-emerald-800',
  NOVEDAD:           'bg-yellow-100 text-yellow-800',
  REPROCESO:         'bg-[#B11917]/10 text-[#B11917]',
  CAMBIO_PRIORIDAD:  'bg-blue-100 text-blue-800',
  ASIGNACION_MAQUINA: 'bg-purple-100 text-purple-800',
  AUTORIZACION:      'bg-[#E7D198]/40 text-amber-800',
  PAUSA:             'bg-gray-100 text-gray-700',
};

function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function OrdenEventosTimeline({ ordenId }: Props) {
  const { data: eventos, isLoading, isError } = useEventosOrden(ordenId);

  if (isLoading) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Cargando eventos…</p>;
  }
  if (isError) {
    return <p className="py-4 text-center text-sm text-destructive">Error al cargar eventos.</p>;
  }
  if (!eventos || eventos.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Sin eventos registrados.</p>;
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {eventos.map((ev) => (
        <li key={ev.id} className="relative">
          <span className="absolute -left-[1.625rem] flex h-5 w-5 items-center justify-center rounded-full bg-muted">
            <Activity className="h-3 w-3 text-muted-foreground" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_EVENTO[ev.tipoEvento]}`}>
              {ETIQUETA_EVENTO[ev.tipoEvento]}
            </span>
          </div>
          <p className="mt-0.5 text-sm">{ev.descripcion}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatearFechaHora(ev.fechaEvento ?? ev.creadoEn)}
            {ev.usuario && <> · <span className="font-medium">{ev.usuario.nombre}</span></>}
          </p>
        </li>
      ))}
    </ol>
  );
}
