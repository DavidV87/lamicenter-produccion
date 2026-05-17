import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EstadoDespachoBadge } from './EstadoDespachoBadge';
import type { Despacho } from '../types/despacho.types';

interface Props {
  despachos: Despacho[] | undefined;
  cargando: boolean;
  error: Error | null;
}

export function TablaDespachos({ despachos, cargando, error }: Props) {
  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {error.message ?? 'Error al cargar despachos.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Pedido</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Sede salida</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Encargado</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">F. programada</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ver</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {cargando
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : despachos?.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No hay despachos registrados.
                  </td>
                </tr>
              )
              : despachos?.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{d.pedido.consecutivo}</td>
                  <td className="px-4 py-3">{d.pedido.cliente.razonSocial}</td>
                  <td className="px-4 py-3">{d.sedeSalida?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">{d.encargadoDespacho?.nombre ?? '—'}</td>
                  <td className="px-4 py-3">
                    {d.fechaProgramada
                      ? new Date(d.fechaProgramada).toLocaleDateString('es-CO')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoDespachoBadge codigo={d.estado.codigo} nombre={d.estado.nombre} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/despacho/despachos/${d.id}`}
                      className="inline-flex items-center gap-1 text-marca-primario hover:underline"
                    >
                      <Eye size={14} />
                      <span>Ver</span>
                    </Link>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
