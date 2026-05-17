import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { SolicitudCompraForm } from '../forms/SolicitudCompraForm';
import { useCrearSolicitudCompra } from '../hooks/useAbastecimiento';
import type { CrearSolicitudCompraPayload } from '../types/abastecimiento.types';

export function NuevaSolicitudCompraPage() {
  const navegar = useNavigate();
  const mutation = useCrearSolicitudCompra();

  function handleSubmit(payload: CrearSolicitudCompraPayload) {
    mutation.mutate(payload, {
      onSuccess: (solicitud) => {
        navegar(`/abastecimiento/solicitudes-compra/${solicitud.id}`);
      },
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/abastecimiento/solicitudes-compra">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva solicitud de compra</h1>
          <p className="text-sm text-muted-foreground">Registrar solicitud a proveedor</p>
        </div>
      </div>

      {mutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al crear la solicitud.'}
        </div>
      )}

      <SolicitudCompraForm
        onSubmit={handleSubmit}
        cargando={mutation.isPending}
      />
    </div>
  );
}
