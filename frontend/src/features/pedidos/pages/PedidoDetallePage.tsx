import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePedidoDetalle } from '../hooks/usePedidos';
import { PedidoEstadoBadge } from '../components/PedidoEstadoBadge';
import { PedidoItemsTable } from '../components/PedidoItemsTable';
import { PedidoHistorial } from '../components/PedidoHistorial';
import { CambiarEstadoPedidoDialog } from '../components/CambiarEstadoPedidoDialog';
import { ValidarPedidoDialog } from '../components/ValidarPedidoDialog';

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

export function PedidoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const [dialogEstado, setDialogEstado]     = useState(false);
  const [dialogValidar, setDialogValidar]   = useState(false);

  const { data: pedido, isLoading, isError, refetch } = usePedidoDetalle(id ?? '');

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        Cargando pedido…
      </div>
    );
  }

  if (isError || !pedido) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/pedidos"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
        </Button>
        <div className="flex h-48 items-center justify-center text-destructive">
          Error al cargar el pedido.
        </div>
      </div>
    );
  }

  const puedeCambiarEstado = tienePermiso('pedidos.cambiar_estado');
  const puedeValidar       = tienePermiso('pedidos.autorizar');

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/pedidos"><ArrowLeft className="mr-1 h-4 w-4" /> Volver</Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{pedido.consecutivo}</h1>
              <PedidoEstadoBadge estado={pedido.estado} />
            </div>
            <p className="text-sm text-muted-foreground">
              Creado el {formatearFecha(pedido.creadoEn)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            <RefreshCw className="mr-1 h-4 w-4" /> Actualizar
          </Button>
          {puedeCambiarEstado && (
            <Button variant="outline" size="sm" onClick={() => setDialogEstado(true)}>
              Cambiar estado
            </Button>
          )}
          {puedeValidar && (
            <Button size="sm" onClick={() => setDialogValidar(true)}>
              Validar pedido
            </Button>
          )}
        </div>
      </div>

      {/* Datos generales */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Datos generales</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Campo label="Cliente" valor={pedido.cliente.razonSocial} />
          <Campo label="Identificación" valor={pedido.cliente.identificacion} />
          <Campo label="Vendedor" valor={pedido.vendedor?.nombre} />
          <Campo label="Sede de venta" valor={pedido.sedeVenta?.nombre} />
          <Campo label="Sede responsable" valor={pedido.sedeResponsable?.nombre} />
          <Campo label="Sede de despacho" valor={pedido.sedeDespacho?.nombre} />
          <Campo label="Entrega prometida" valor={formatearFecha(pedido.fechaEntregaPrometida)} />
        </div>
        {pedido.observaciones && (
          <div className="mt-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <span className="text-xs text-muted-foreground">Observaciones: </span>
            {pedido.observaciones}
          </div>
        )}
      </section>

      {/* Ítems */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">
          Ítems
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({pedido.items.length})
          </span>
        </h2>
        <PedidoItemsTable items={pedido.items} />
      </section>

      {/* Historial */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="mb-4 font-semibold">Historial de estados</h2>
        <PedidoHistorial pedidoId={pedido.id} />
      </section>

      {/* Diálogos */}
      {puedeCambiarEstado && (
        <CambiarEstadoPedidoDialog
          pedidoId={pedido.id}
          abierto={dialogEstado}
          onCerrar={() => setDialogEstado(false)}
        />
      )}
      {puedeValidar && (
        <ValidarPedidoDialog
          pedidoId={pedido.id}
          abierto={dialogValidar}
          onCerrar={() => setDialogValidar(false)}
        />
      )}
    </div>
  );
}
