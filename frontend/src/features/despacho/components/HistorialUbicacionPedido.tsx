import { MapPin } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { UbicacionPedido } from '../types/despacho.types';

interface Props {
  ubicacion: UbicacionPedido | null | undefined;
  cargando: boolean;
}

export function HistorialUbicacionPedido({ ubicacion, cargando }: Props) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!ubicacion) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No hay información de ubicación para este pedido.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ubicación actual */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
        <MapPin size={16} className="mt-0.5 shrink-0 text-marca-primario" />
        <div className="text-sm">
          <p className="font-medium">Ubicación actual</p>
          <p className="text-muted-foreground">
            Sede: {ubicacion.sedeActual?.nombre ?? '—'}
            {ubicacion.ubicacionActual && (
              <> · {ubicacion.ubicacionActual.nombre} ({ubicacion.ubicacionActual.codigo})</>
            )}
          </p>
          {ubicacion.observaciones && (
            <p className="mt-1 text-xs text-muted-foreground">{ubicacion.observaciones}</p>
          )}
        </div>
      </div>

      {/* Historial */}
      {ubicacion.historial.length > 0 && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Historial de movimientos</p>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Sede</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Ubicación</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Observaciones</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Registrado por</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {ubicacion.historial.map((h) => (
                  <tr key={h.id} className="hover:bg-muted/30">
                    <td className="px-4 py-2">{h.sede.nombre}</td>
                    <td className="px-4 py-2">
                      {h.ubicacion
                        ? `${h.ubicacion.nombre} (${h.ubicacion.codigo})`
                        : '—'}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{h.observaciones ?? '—'}</td>
                    <td className="px-4 py-2">{h.creadoPor?.nombre ?? '—'}</td>
                    <td className="px-4 py-2">
                      {new Date(h.creadoEn).toLocaleDateString('es-CO')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
