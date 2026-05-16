import { useNavigate } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { PedidoEstadoBadge } from './PedidoEstadoBadge';
import type { Pedido } from '../types/pedidos.types';

interface Props {
  pedidos: Pedido[];
  isLoading: boolean;
  isError: boolean;
}

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function TablaPedidos({ pedidos, isLoading, isError }: Props) {
  const navegar = useNavigate();

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Consecutivo</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Vendedor</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Sede venta</TableHead>
            <TableHead>Entrega prometida</TableHead>
            <TableHead className="w-20 text-right">Ver</TableHead>
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
                Error al cargar pedidos.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !isError && pedidos.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                Sin resultados.
              </TableCell>
            </TableRow>
          )}
          {pedidos.map((p) => (
            <TableRow key={p.id} className="cursor-pointer hover:bg-muted/30"
              onClick={() => navegar(`/pedidos/${p.id}`)}>
              <TableCell>
                <span className="font-mono text-xs font-semibold">{p.consecutivo}</span>
              </TableCell>
              <TableCell>
                <div className="font-medium">{p.cliente.razonSocial}</div>
                <div className="text-xs text-muted-foreground">{p.cliente.identificacion}</div>
              </TableCell>
              <TableCell>{p.vendedor?.nombre ?? '—'}</TableCell>
              <TableCell>
                <PedidoEstadoBadge estado={p.estado} />
              </TableCell>
              <TableCell>{p.sedeVenta?.nombre ?? '—'}</TableCell>
              <TableCell>{formatearFecha(p.fechaEntregaPrometida)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); navegar(`/pedidos/${p.id}`); }}
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
