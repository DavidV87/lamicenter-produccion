import { Package, Factory, ShoppingCart, Truck, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/shared/components/ui/skeleton';
import type { ResumenGeneralDashboard } from '@/shared/types';

interface DatoKPI {
  etiqueta:    string;
  valor:       number;
  subEtiqueta: string;
  Icono:       React.ElementType;
  colorIcono:  string;
  colorFondo:  string;
}

function construirKPIs(r: ResumenGeneralDashboard): DatoKPI[] {
  return [
    {
      etiqueta:    'Pedidos totales',
      valor:       r.pedidos.total,
      subEtiqueta: `${r.pedidos.pendientes} pendientes · ${r.pedidos.enProceso} en proceso`,
      Icono: Package,
      colorIcono: 'text-marca-primario',
      colorFondo: 'bg-marca-primario/8',
    },
    {
      etiqueta:    'Órdenes activas',
      valor:       r.produccion.ordenesActivas,
      subEtiqueta: `${r.produccion.etapasActivas} etapas activas`,
      Icono: Factory,
      colorIcono: 'text-emerald-600',
      colorFondo: 'bg-emerald-50',
    },
    {
      etiqueta:    'Requerimientos pendientes',
      valor:       r.abastecimiento.requerimientosPendientes,
      subEtiqueta: `${r.abastecimiento.solicitudesActivas} solicitudes activas`,
      Icono: ShoppingCart,
      colorIcono: 'text-amber-600',
      colorFondo: 'bg-amber-50',
    },
    {
      etiqueta:    'Despachos pendientes',
      valor:       r.despacho.pendientes,
      subEtiqueta: `${r.despacho.despachadosHoy} despachados hoy`,
      Icono: Truck,
      colorIcono: 'text-blue-600',
      colorFondo: 'bg-blue-50',
    },
    {
      etiqueta:    'PQRS abiertas',
      valor:       r.pqrs.abiertas,
      subEtiqueta: `${r.pqrs.enRevision} en revisión · ${r.pqrs.cerradas} cerradas`,
      Icono: MessageSquare,
      colorIcono: 'text-marca-rojo',
      colorFondo: 'bg-marca-rojo/8',
    },
  ];
}

interface Props {
  resumen?:  ResumenGeneralDashboard;
  cargando:  boolean;
}

export function TarjetasKPI({ resumen, cargando }: Props) {
  if (cargando || !resumen) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-white shadow-sm border border-marca-gris/50 overflow-hidden">
            <div className="h-1 bg-marca-gris/30" />
            <div className="p-5 space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = construirKPIs(resumen);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {kpis.map(({ etiqueta, valor, subEtiqueta, Icono, colorIcono, colorFondo }) => (
        <div
          key={etiqueta}
          className="group rounded-lg bg-white shadow-sm border border-marca-gris/50 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Borde superior dorado — identidad Lamicenter */}
          <div className="h-1 bg-marca-dorado" />

          <div className="p-5">
            <div className="mb-3 flex items-start justify-between">
              <p className="text-xs font-medium text-muted-foreground leading-tight pr-2">
                {etiqueta}
              </p>
              <div className={`shrink-0 rounded-lg p-1.5 ${colorFondo}`}>
                <Icono size={16} className={colorIcono} />
              </div>
            </div>

            <p className="text-2xl font-bold text-marca-negro tabular-nums">
              {valor.toLocaleString('es-CO')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{subEtiqueta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
