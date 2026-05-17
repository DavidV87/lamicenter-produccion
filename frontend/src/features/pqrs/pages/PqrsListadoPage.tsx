import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { usePqrs } from '../hooks/usePqrs';
import { TablaPqrs } from '../components/TablaPqrs';

export function PqrsListadoPage() {
  const [pagina, setPagina] = useState(1);
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const { data, isLoading, error } = usePqrs({ pagina, limite: 20 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PQRS</h1>
          <p className="text-muted-foreground">
            {data
              ? `${data.total} PQRS registrada${data.total !== 1 ? 's' : ''}`
              : ''}
          </p>
        </div>

        {tienePermiso('pqrs.crear') && (
          <Link to="/pqrs/nueva">
            <Button size="sm">
              <Plus size={15} className="mr-1.5" />
              Nueva PQRS
            </Button>
          </Link>
        )}
      </div>

      <TablaPqrs
        pqrs={data?.datos}
        cargando={isLoading}
        error={error}
      />

      {data && data.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Página {pagina} de {data.totalPaginas}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={pagina <= 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pagina >= data.totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
