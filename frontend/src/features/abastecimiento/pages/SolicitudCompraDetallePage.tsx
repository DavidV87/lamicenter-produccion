import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useSolicitudCompraDetalle } from '../hooks/useAbastecimiento';
import { EstadoAbastecimientoBadge } from '../components/EstadoAbastecimientoBadge';
import { SolicitudCompraItemsTable } from '../components/SolicitudCompraItemsTable';
import { CambiarEstadoSolicitudDialog } from '../components/CambiarEstadoSolicitudDialog';

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valor ?? '—'}</p>
    </div>
  );
}

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function SolicitudCompraDetallePage() {
  const { id } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const [dialogEstado, setDialogEstado] = useState(false);

  const { data: sol, isLoading, isError, refetch } = useSolicitudCompraDetalle(id ?? '');

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Cargando solicitud…
      </div>
    );
  }

  if (isError || !sol) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/abastecimiento/solicitudes-compra">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div className="flex h-48 items-center justify-center text-destructive">
          Error al cargar la solicitud de compra.
        </div>
      </div>
    );
  }

  const puedeCambiarEstado = tienePermiso('abastecimiento.cambiar_estado');

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/abastecimiento/solicitudes-compra">
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {sol.codigo ?? sol.id.slice(0, 8).toUpperCase()}
              </h1>
              <EstadoAbastecimientoBadge estado={sol.estado} />
            </div>
            <p className="text-xs font-mono text-muted-foreground">{sol.id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
          </Button>
          {puedeCambiarEstado && (
            <Button variant="outline" size="sm" onClick={() => setDialogEstado(true)}>
              Cambiar estado
            </Button>
          )}
        </div>
      </div>

      {/* Datos generales */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Datos generales</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo label="Sede"          valor={sol.sede?.nombre} />
          <Campo label="Proveedor"     valor={sol.proveedor?.razonSocial} />
          <Campo label="Creado por"    valor={sol.creadoPor?.nombre} />
          <Campo label="Fecha creación" valor={formatearFecha(sol.creadoEn)} />
          <Campo label="Última actualización" valor={formatearFecha(sol.actualizadoEn)} />
        </div>
        {sol.observaciones && (
          <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">Observaciones: </span>
            {sol.observaciones}
          </div>
        )}
      </section>

      {/* Ítems */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">
          Ítems
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({sol.items.length})
          </span>
        </h2>
        <SolicitudCompraItemsTable items={sol.items} />
      </section>

      {puedeCambiarEstado && (
        <CambiarEstadoSolicitudDialog
          solicitudId={sol.id}
          abierto={dialogEstado}
          onCerrar={() => setDialogEstado(false)}
        />
      )}
    </div>
  );
}
