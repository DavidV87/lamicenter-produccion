import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ModoCreacionPedidoCard } from '../components/ModoCreacionPedidoCard';
import { PedidoManualForm } from '../forms/PedidoManualForm';
import { useCrearPedido } from '../hooks/usePedidos';
import type { CrearPedidoPayload } from '../types/pedidos.types';

type Modo = 'seleccion' | 'manual';

export function NuevoPedidoPage() {
  const [modo, setModo] = useState<Modo>('seleccion');
  const navegar = useNavigate();
  const crearMutation = useCrearPedido();

  function handleCrear(payload: CrearPedidoPayload) {
    crearMutation.mutate(payload, {
      onSuccess: (pedido) => navegar(`/pedidos/${pedido.id}`),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/pedidos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo pedido</h1>
          <p className="text-sm text-muted-foreground">
            {modo === 'seleccion' ? 'Selecciona cómo ingresar el pedido' : 'Ingreso manual de ítems'}
          </p>
        </div>
      </div>

      {modo === 'seleccion' && (
        <ModoCreacionPedidoCard onSeleccionarManual={() => setModo('manual')} />
      )}

      {modo === 'manual' && (
        <div className="max-w-3xl">
          <div className="mb-4">
            <Button variant="ghost" size="sm" onClick={() => setModo('seleccion')}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Cambiar modo
            </Button>
          </div>

          {crearMutation.isError && (
            <div className="mb-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {(crearMutation.error as Error)?.message ?? 'Error al crear el pedido. Intenta de nuevo.'}
            </div>
          )}

          <PedidoManualForm
            onSubmit={handleCrear}
            cargando={crearMutation.isPending}
          />
        </div>
      )}
    </div>
  );
}
