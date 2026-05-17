import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useUbicacionPedido } from '../hooks/useDespacho';
import { HistorialUbicacionPedido } from '../components/HistorialUbicacionPedido';
import { UbicacionPedidoForm } from '../forms/UbicacionPedidoForm';

export function UbicacionPedidoPage() {
  const { pedidoId = '' } = useParams<{ pedidoId: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  const [mostrarForm, setMostrarForm] = useState(false);

  const { data: ubicacion, isLoading, error } = useUbicacionPedido(pedidoId);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/despacho/despachos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Volver a despachos
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Ubicación del pedido</h1>
          <p className="text-sm text-muted-foreground font-mono">{pedidoId}</p>
        </div>

        {tienePermiso('despacho.editar') && !mostrarForm && (
          <Button size="sm" onClick={() => setMostrarForm(true)}>
            Actualizar ubicación
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error)?.message ?? 'Error al cargar ubicación.'}
        </p>
      )}

      {mostrarForm && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle className="text-base">Nueva ubicación</CardTitle>
          </CardHeader>
          <CardContent>
            <UbicacionPedidoForm
              pedidoId={pedidoId}
              onExito={() => setMostrarForm(false)}
              onCancelar={() => setMostrarForm(false)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de ubicación</CardTitle>
        </CardHeader>
        <CardContent>
          <HistorialUbicacionPedido ubicacion={ubicacion} cargando={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
