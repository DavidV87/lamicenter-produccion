import type { ItemSolicitudCompra } from '../types/abastecimiento.types';

interface Props {
  items: ItemSolicitudCompra[];
}

export function SolicitudCompraItemsTable({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sin ítems registrados.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ítem</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cant. solicitada</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Cant. recibida</th>
            <th className="px-3 py-2 text-right font-medium text-muted-foreground">Precio unit.</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Observaciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((it) => (
            <tr key={it.id} className="hover:bg-muted/10">
              <td className="px-3 py-2">
                <p className="font-medium">{it.item?.nombre ?? '—'}</p>
                {it.item && (
                  <p className="text-xs text-muted-foreground">{it.item.codigo} · {it.item.unidadMedida}</p>
                )}
              </td>
              <td className="px-3 py-2 text-right font-mono">{it.cantidadSolicitada}</td>
              <td className="px-3 py-2 text-right font-mono">{it.cantidadRecibida}</td>
              <td className="px-3 py-2 text-right font-mono">
                {it.precioUnitario != null
                  ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(it.precioUnitario)
                  : '—'}
              </td>
              <td className="px-3 py-2 text-muted-foreground text-xs">{it.observaciones ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
