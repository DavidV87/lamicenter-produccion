import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { OrdenProduccionForm } from '../forms/OrdenProduccionForm';
import { useCrearOrdenProduccion } from '../hooks/useProduccion';
import type { CrearOrdenProduccionPayload } from '../types/produccion.types';

export function NuevaOrdenProduccionPage() {
  const navegar = useNavigate();
  const crearMutation = useCrearOrdenProduccion();

  function handleCrear(payload: CrearOrdenProduccionPayload) {
    crearMutation.mutate(payload, {
      onSuccess: (orden) => navegar(`/produccion/ordenes/${orden.id}`),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/produccion/ordenes">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva orden de producción</h1>
          <p className="text-sm text-muted-foreground">Vincula un pedido a la línea de producción</p>
        </div>
      </div>

      {crearMutation.isError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {(crearMutation.error as Error)?.message ?? 'Error al crear la orden. Intenta de nuevo.'}
        </div>
      )}

      <div className="max-w-2xl">
        <OrdenProduccionForm
          onSubmit={handleCrear}
          cargando={crearMutation.isPending}
        />
      </div>
    </div>
  );
}
