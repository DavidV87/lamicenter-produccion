import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EstadoAbastecimientoBadge } from './EstadoAbastecimientoBadge';
import type { RequerimientoMaterial } from '../types/abastecimiento.types';

const ETIQUETA_TIPO: Record<string, string> = {
  GENERAL:      'General',
  PEDIDO:       'Pedido',
  PRODUCCION:   'Producción',
  MANTENIMIENTO: 'Mantenimiento',
};

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

interface Props {
  requerimientos: RequerimientoMaterial[];
  isLoading: boolean;
  isError: boolean;
}

export function TablaRequerimientos({ requerimientos, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded" />)}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-destructive">
        Error al cargar requerimientos.
      </div>
    );
  }

  if (requerimientos.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No hay requerimientos registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ítem</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sede</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Cant. requerida</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha necesaria</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {requerimientos.map((r) => (
            <tr key={r.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium">{r.item?.nombre ?? '—'}</p>
                {r.item && (
                  <p className="text-xs text-muted-foreground">{r.item.codigo} · {r.item.unidadMedida}</p>
                )}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{r.sede?.nombre ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {ETIQUETA_TIPO[r.tipoRequerimiento] ?? r.tipoRequerimiento}
              </td>
              <td className="px-4 py-3 text-right font-mono">{r.cantidadRequerida}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatearFecha(r.fechaNecesaria)}</td>
              <td className="px-4 py-3">
                <EstadoAbastecimientoBadge estado={r.estado} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/abastecimiento/requerimientos/${r.id}`}
                  className="text-xs text-marca-primario hover:underline font-medium"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
