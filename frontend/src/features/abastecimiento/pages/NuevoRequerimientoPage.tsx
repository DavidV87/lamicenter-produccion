import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { RequerimientoMaterialForm } from '../forms/RequerimientoMaterialForm';
import { useCrearRequerimiento } from '../hooks/useAbastecimiento';
import type { CrearRequerimientoPayload } from '../types/abastecimiento.types';

export function NuevoRequerimientoPage() {
  const navegar = useNavigate();
  const mutation = useCrearRequerimiento();

  function handleSubmit(payload: CrearRequerimientoPayload) {
    mutation.mutate(payload, {
      onSuccess: (requerimiento) => {
        navegar(`/abastecimiento/requerimientos/${requerimiento.id}`);
      },
    });
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/abastecimiento/requerimientos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo requerimiento</h1>
          <p className="text-sm text-muted-foreground">Registrar solicitud de material</p>
        </div>
      </div>

      {mutation.isError && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al crear el requerimiento.'}
        </div>
      )}

      <RequerimientoMaterialForm
        onSubmit={handleSubmit}
        cargando={mutation.isPending}
      />
    </div>
  );
}
