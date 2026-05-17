import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRequerimientoDetalle } from '../hooks/useAbastecimiento';
import { EstadoAbastecimientoBadge } from '../components/EstadoAbastecimientoBadge';
import { CambiarEstadoRequerimientoDialog } from '../components/CambiarEstadoRequerimientoDialog';

const ETIQUETA_TIPO: Record<string, string> = {
  GENERAL: 'General', PEDIDO: 'Pedido', PRODUCCION: 'Producción', MANTENIMIENTO: 'Mantenimiento',
};

function Campo({ label, valor }: { label: string; valor: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{valor ?? '—'}</p>
    </div>
  );
}

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

export function RequerimientoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const [dialogEstado, setDialogEstado] = useState(false);

  const { data: req, isLoading, isError, refetch } = useRequerimientoDetalle(id ?? '');

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Cargando requerimiento…
      </div>
    );
  }

  if (isError || !req) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/abastecimiento/requerimientos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div className="flex h-48 items-center justify-center text-destructive">
          Error al cargar el requerimiento.
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
            <Link to="/abastecimiento/requerimientos">
              <ArrowLeft className="mr-1 h-4 w-4" /> Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Requerimiento</h1>
              <EstadoAbastecimientoBadge estado={req.estado} />
            </div>
            <p className="text-xs font-mono text-muted-foreground">{req.id}</p>
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

      {/* Datos */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Detalle del requerimiento</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo label="Ítem"             valor={req.item ? `${req.item.nombre} (${req.item.codigo})` : null} />
          <Campo label="Unidad de medida" valor={req.item?.unidadMedida} />
          <Campo label="Sede"             valor={req.sede?.nombre} />
          <Campo label="Tipo"             valor={ETIQUETA_TIPO[req.tipoRequerimiento] ?? req.tipoRequerimiento} />
          <Campo label="Cant. requerida"  valor={String(req.cantidadRequerida)} />
          <Campo label="Cant. atendida"   valor={String(req.cantidadAtendida)} />
          <Campo label="Fecha necesaria"  valor={formatearFecha(req.fechaNecesaria)} />
          <Campo label="Creado por"       valor={req.creadoPor?.nombre} />
          <Campo label="Fecha creación"   valor={formatearFecha(req.creadoEn)} />
          {req.pedidoId && (
            <div>
              <p className="text-xs text-muted-foreground">Pedido vinculado</p>
              <Link
                to={`/pedidos/${req.pedidoId}`}
                className="text-sm font-mono text-marca-primario hover:underline"
              >
                {req.pedidoId.slice(0, 8).toUpperCase()}
              </Link>
            </div>
          )}
          {req.ordenProduccionId && (
            <div>
              <p className="text-xs text-muted-foreground">Orden de producción</p>
              <Link
                to={`/produccion/ordenes/${req.ordenProduccionId}`}
                className="text-sm font-mono text-marca-primario hover:underline"
              >
                {req.ordenProduccionId.slice(0, 8).toUpperCase()}
              </Link>
            </div>
          )}
        </div>
        {req.observaciones && (
          <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">Observaciones: </span>
            {req.observaciones}
          </div>
        )}
      </section>

      {puedeCambiarEstado && (
        <CambiarEstadoRequerimientoDialog
          requerimientoId={req.id}
          abierto={dialogEstado}
          onCerrar={() => setDialogEstado(false)}
        />
      )}
    </div>
  );
}
