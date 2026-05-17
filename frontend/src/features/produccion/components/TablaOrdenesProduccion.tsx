import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { OrdenEstadoBadge } from './OrdenEstadoBadge';
import type { OrdenProduccion } from '../types/produccion.types';

interface Props {
  ordenes: OrdenProduccion[];
  isLoading: boolean;
  isError: boolean;
}

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function TablaOrdenesProduccion({ ordenes, isLoading, isError }: Props) {
  const navegar = useNavigate();

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Consecutivo</TableHead>
            <TableHead>Pedido</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Sede producción</TableHead>
            <TableHead className="text-right">Prioridad</TableHead>
            <TableHead>Fin planeado</TableHead>
            <TableHead className="w-16 text-right">Ver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Cargando…
              </TableCell>
            </TableRow>
          )}
          {isError && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-destructive">
                Error al cargar órdenes.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && ordenes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
          {ordenes.map((o) => (
            <TableRow
              key={o.id}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navegar(`/produccion/ordenes/${o.id}`)}
            >
              <TableCell>
                <span className="font-mono text-xs font-semibold">{o.consecutivo}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-xs">{o.pedido.consecutivo}</span>
              </TableCell>
              <TableCell>
                <OrdenEstadoBadge estado={o.estado} />
              </TableCell>
              <TableCell>{o.sedeProduccion?.nombre ?? '—'}</TableCell>
              <TableCell className="text-right font-mono text-sm">{o.ordenPrioridad}</TableCell>
              <TableCell>{formatearFecha(o.fechaFinPlaneada)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navegar(`/produccion/ordenes/${o.id}`); }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
