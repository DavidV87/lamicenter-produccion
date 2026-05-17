import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useDespachos } from '../hooks/useDespacho';
import { TablaDespachos } from '../components/TablaDespachos';

export function DespachosPage() {
  const [pagina, setPagina] = useState(1);
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const { data, isLoading, error } = useDespachos({ pagina, limite: 20 });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Despachos</h1>
          <p className="text-muted-foreground">
            {data ? `${data.total} despacho${data.total !== 1 ? 's' : ''} registrado${data.total !== 1 ? 's' : ''}` : ''}
          </p>
        </div>

        {tienePermiso('despacho.crear') && (
          <Link to="/despacho/despachos/nuevo">
            <Button size="sm">
              <Plus size={15} className="mr-1.5" />
              Nuevo despacho
            </Button>
          </Link>
        )}
      </div>

      <TablaDespachos
        despachos={data?.datos}
        cargando={isLoading}
        error={error}
      />

      {/* Paginación */}
      {data && data.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Página {pagina} de {data.totalPaginas}
          </span>
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
