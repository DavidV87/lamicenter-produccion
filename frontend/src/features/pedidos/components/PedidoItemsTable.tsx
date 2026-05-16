import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import type { ItemPedido, DestinoOperativo } from '../types/pedidos.types';

interface Props {
  items: ItemPedido[];
}

const DESTINO_LABEL: Record<DestinoOperativo, string> = {
  PRODUCCION:        'Producción',
  DESPACHO_DIRECTO:  'Despacho directo',
  MIXTO:             'Mixto',
};

export function PedidoItemsTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">Sin ítems registrados.</p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Producción</TableHead>
            <TableHead className="text-right">Despacho</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Material cliente</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((it) => (
            <TableRow key={it.id}>
              <TableCell className="text-muted-foreground">{it.ordenLinea}</TableCell>
              <TableCell>
                <div className="font-medium">{it.descripcionOperativa}</div>
                {it.item && (
                  <div className="text-xs text-muted-foreground">
                    {it.item.codigo} — {it.item.nombre} ({it.item.unidadMedida})
                  </div>
                )}
                {it.observaciones && (
                  <div className="mt-0.5 text-xs italic text-muted-foreground">{it.observaciones}</div>
                )}
              </TableCell>
              <TableCell className="text-right font-mono">{it.cantidadTotal}</TableCell>
              <TableCell className="text-right font-mono">{it.cantidadParaProduccion}</TableCell>
              <TableCell className="text-right font-mono">{it.cantidadParaDespachoEntero}</TableCell>
              <TableCell>
                <span className="text-sm">{DESTINO_LABEL[it.destinoOperativo]}</span>
              </TableCell>
              <TableCell>
                {it.esMaterialCliente
                  ? <span className="text-xs text-[#636620] font-medium">Sí</span>
                  : <span className="text-xs text-muted-foreground">No</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
