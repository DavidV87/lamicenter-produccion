import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { EstadoPqrsBadge } from './EstadoPqrsBadge';
import type { PqrsResumen } from '../types/pqrs.types';

interface Props {
  pqrs: PqrsResumen[] | undefined;
  cargando: boolean;
  error: Error | null;
}

export function TablaPqrs({ pqrs, cargando, error }: Props) {
  if (error) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {error.message ?? 'Error al cargar PQRS.'}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Consecutivo</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cliente</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descripción</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Reproceso</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Fecha</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Ver</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {cargando
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : pqrs?.length === 0
              ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No hay PQRS registradas.
                  </td>
                </tr>
              )
              : pqrs?.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{p.consecutivo}</td>
                  <td className="px-4 py-3">{p.cliente.razonSocial}</td>
                  <td className="px-4 py-3">{p.tipoNovedad.nombre}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                    {p.descripcion}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.generaReproceso
                      ? <span className="text-xs font-medium text-orange-700">Sí</span>
                      : <span className="text-xs text-muted-foreground">No</span>}
                  </td>
                  <td className="px-4 py-3">
                    <EstadoPqrsBadge codigo={p.estadoPqrs.codigo} nombre={p.estadoPqrs.nombre} />
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(p.creadoEn).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/pqrs/${p.id}`}
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
