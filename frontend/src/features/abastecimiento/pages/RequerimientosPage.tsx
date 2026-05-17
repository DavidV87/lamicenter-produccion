import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { BuscadorEntidad } from '@/shared/components/BuscadorEntidad';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { TablaRequerimientos } from '../components/TablaRequerimientos';
import { useRequerimientos } from '../hooks/useAbastecimiento';

const LIMITE = 10;

function Paginador({
  pagina, totalPaginas, total, limite, onCambiar,
}: {
  pagina: number; totalPaginas: number; total: number; limite: number;
  onCambiar: (p: number) => void;
}) {
  const desde = (pagina - 1) * limite + 1;
  const hasta = Math.min(pagina * limite, total);
  return (
    <div className="flex items-center justify-between px-1 py-1 text-sm text-muted-foreground">
      <span>{total > 0 ? `${desde}–${hasta} de ${total}` : '0 registros'}</span>
      <div className="flex gap-1">
        <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </Button>
        <Button variant="outline" size="sm" disabled={pagina >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>
          Siguiente
        </Button>
      </div>
    </div>
  );
}

export function RequerimientosPage() {
  const [pagina, setPagina]     = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const { data, isLoading, isError } = useRequerimientos({ pagina, limite: LIMITE, busqueda: busqueda || undefined });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Requerimientos de material</h1>
          <p className="text-sm text-muted-foreground">Solicitudes internas de materiales</p>
        </div>
        {tienePermiso('abastecimiento.crear') && (
          <Button asChild>
            <Link to="/abastecimiento/requerimientos/nuevo">
              <Plus className="mr-2 h-4 w-4" /> Nuevo requerimiento
            </Link>
          </Button>
        )}
      </div>

      <BuscadorEntidad
        placeholder="Buscar por ítem u observaciones…"
        onBuscar={(t) => { setBusqueda(t); setPagina(1); }}
      />

      <TablaRequerimientos
        requerimientos={data?.datos ?? []}
        isLoading={isLoading}
        isError={isError}
      />

      {data && data.totalPaginas > 1 && (
        <Paginador
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          total={data.total}
          limite={data.limite}
          onCambiar={setPagina}
        />
      )}
    </div>
  );
}
