import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useOrdenProduccionDetalle } from '../hooks/useProduccion';
import { OrdenEstadoBadge } from '../components/OrdenEstadoBadge';
import { OrdenEtapasTable } from '../components/OrdenEtapasTable';
import { OrdenEventosTimeline } from '../components/OrdenEventosTimeline';
import { CambiarEstadoOrdenDialog } from '../components/CambiarEstadoOrdenDialog';
import { CrearEtapaDialog } from '../components/CrearEtapaDialog';
import { AsignarEtapaDialog } from '../components/AsignarEtapaDialog';
import { CrearEventoOperativoDialog } from '../components/CrearEventoOperativoDialog';

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valor ?? '—'}</p>
    </div>
  );
}

function formatearFecha(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function OrdenProduccionDetallePage() {
  const { id } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const [dialogEstado,  setDialogEstado]  = useState(false);
  const [dialogEtapa,   setDialogEtapa]   = useState(false);
  const [dialogEvento,  setDialogEvento]  = useState(false);
  const [etapaAsignar,  setEtapaAsignar]  = useState<string | null>(null);

  const { data: orden, isLoading, isError, refetch } = useOrdenProduccionDetalle(id ?? '');

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Cargando orden…
      </div>
    );
  }

  if (isError || !orden) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/produccion/ordenes"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
        </Button>
        <div className="flex h-48 items-center justify-center text-destructive">
          Error al cargar la orden de producción.
        </div>
      </div>
    );
  }

  const puedeCambiarEstado = tienePermiso('produccion.cambiar_estado');
  const puedeCrearEtapa    = tienePermiso('produccion.crear');
  const puedeAsignar       = tienePermiso('produccion.asignar');
  const puedeEvento        = tienePermiso('produccion.crear');

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/produccion/ordenes"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{orden.consecutivo}</h1>
              <OrdenEstadoBadge estado={orden.estado} />
            </div>
            <p className="text-sm text-muted-foreground">
              Pedido <span className="font-mono">{orden.pedido.consecutivo}</span>
              {' · '}Creada el {formatearFecha(orden.creadoEn)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
          </Button>
          {puedeEvento && (
            <Button variant="outline" size="sm" onClick={() => setDialogEvento(true)}>
              Registrar evento
            </Button>
          )}
          {puedeCrearEtapa && (
            <Button variant="outline" size="sm" onClick={() => setDialogEtapa(true)}>
              Agregar etapa
            </Button>
          )}
          {puedeCambiarEstado && (
            <Button size="sm" onClick={() => setDialogEstado(true)}>
              Cambiar estado
            </Button>
          )}
        </div>
      </div>

      {/* Datos generales */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Datos generales</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo label="Sede de producción" valor={orden.sedeProduccion?.nombre} />
          <Campo label="Sede actual"        valor={orden.sedeActual?.nombre} />
          <Campo label="Sede de despacho"   valor={orden.sedeDespacho?.nombre} />
          <Campo label="Máquina principal"  valor={
            orden.maquinaPrincipal
              ? `${orden.maquinaPrincipal.nombre} (${orden.maquinaPrincipal.codigo})`
              : null
          } />
          <Campo label="Prioridad"          valor={String(orden.ordenPrioridad)} />
          <Campo label="Inicio planeado"    valor={formatearFecha(orden.fechaInicioPlaneada)} />
          <Campo label="Fin planeado"       valor={formatearFecha(orden.fechaFinPlaneada)} />
          <Campo label="Inicio real"        valor={formatearFecha(orden.fechaInicioReal)} />
        </div>
        {orden.observaciones && (
          <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">Observaciones: </span>
            {orden.observaciones}
          </div>
        )}
      </section>

      {/* Etapas */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">
          Etapas
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({orden.etapas.length})
          </span>
        </h2>
        <OrdenEtapasTable
          etapas={orden.etapas}
          puedeAsignar={puedeAsignar}
          onAsignar={(etapaId) => setEtapaAsignar(etapaId)}
        />
      </section>

      {/* Eventos */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Eventos operativos</h2>
        <OrdenEventosTimeline ordenId={orden.id} />
      </section>

      {/* Diálogos */}
      {puedeCambiarEstado && (
        <CambiarEstadoOrdenDialog
          ordenId={orden.id}
          abierto={dialogEstado}
          onCerrar={() => setDialogEstado(false)}
        />
      )}
      {puedeCrearEtapa && (
        <CrearEtapaDialog
          ordenId={orden.id}
          abierto={dialogEtapa}
          onCerrar={() => setDialogEtapa(false)}
        />
      )}
      {puedeEvento && (
        <CrearEventoOperativoDialog
          ordenId={orden.id}
          abierto={dialogEvento}
          onCerrar={() => setDialogEvento(false)}
        />
      )}
      {puedeAsignar && etapaAsignar && (
        <AsignarEtapaDialog
          ordenId={orden.id}
          etapaId={etapaAsignar}
          abierto={!!etapaAsignar}
          onCerrar={() => setEtapaAsignar(null)}
        />
      )}
    </div>
  );
}
