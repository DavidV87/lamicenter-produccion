import { Link } from 'react-router-dom';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EstadoAbastecimientoBadge } from './EstadoAbastecimientoBadge';
import type { SolicitudCompra } from '../types/abastecimiento.types';

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

interface Props {
  solicitudes: SolicitudCompra[];
  isLoading: boolean;
  isError: boolean;
}

export function TablaSolicitudesCompra({ solicitudes, isLoading, isError }: Props) {
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
        Error al cargar solicitudes de compra.
      </div>
    );
  }

  if (solicitudes.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
        No hay solicitudes de compra registradas.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Código / ID</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sede</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Proveedor</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ítems</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {solicitudes.map((s) => (
            <tr key={s.id} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 font-mono text-xs">
                {s.codigo ?? s.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{s.sede?.nombre ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.proveedor?.razonSocial ?? '—'}</td>
              <td className="px-4 py-3 text-right">{s.items.length}</td>
              <td className="px-4 py-3 text-muted-foreground">{formatearFecha(s.creadoEn)}</td>
              <td className="px-4 py-3">
                <EstadoAbastecimientoBadge estado={s.estado} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/abastecimiento/solicitudes-compra/${s.id}`}
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
