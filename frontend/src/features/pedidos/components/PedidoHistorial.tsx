import { Clock } from 'lucide-react';
import { useHistorialPedido } from '../hooks/usePedidos';
import { PedidoEstadoBadge } from './PedidoEstadoBadge';

interface Props {
  pedidoId: string;
}

function formatearFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function PedidoHistorial({ pedidoId }: Props) {
  const { data: historial, isLoading, isError } = useHistorialPedido(pedidoId);

  if (isLoading) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Cargando historial…</p>;
  }

  if (isError) {
    return <p className="py-4 text-center text-sm text-destructive">Error al cargar historial.</p>;
  }

  if (!historial || historial.length === 0) {
    return <p className="py-4 text-center text-sm text-muted-foreground">Sin movimientos registrados.</p>;
  }

  return (
    <ol className="relative space-y-4 border-l border-border pl-6">
      {historial.map((h) => (
        <li key={h.id} className="relative">
          <span className="absolute -left-[1.625rem] flex h-5 w-5 items-center justify-center rounded-full bg-muted">
            <Clock className="h-3 w-3 text-muted-foreground" />
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {h.estadoAnterior && (
              <>
                <PedidoEstadoBadge estado={h.estadoAnterior} />
                <span className="text-xs text-muted-foreground">→</span>
              </>
            )}
            <PedidoEstadoBadge estado={h.estadoNuevo} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatearFechaHora(h.creadoEn)}
            {h.usuario && <> · <span className="font-medium">{h.usuario.nombre}</span></>}
          </p>
          {h.observaciones && (
            <p className="mt-0.5 text-xs italic text-muted-foreground">"{h.observaciones}"</p>
          )}
        </li>
      ))}
    </ol>
  );
}
