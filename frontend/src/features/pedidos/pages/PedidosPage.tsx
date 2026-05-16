import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { TablaPedidos } from '../components/TablaPedidos';
import { usePedidos } from '../hooks/usePedidos';

const LIMITE = 10;

function PaginadorPedidos({
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

export function PedidosPage() {
  const [pagina, setPagina] = useState(1);

  const { data, isLoading, isError } = usePedidos({ pagina, limite: LIMITE });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">Órdenes de venta y producción</p>
        </div>
        <Button asChild>
          <Link to="/pedidos/nuevo">
            <Plus className="mr-2 h-4 w-4" /> Nuevo pedido
          </Link>
        </Button>
      </div>

      <TablaPedidos
        pedidos={data?.datos ?? []}
        isLoading={isLoading}
        isError={isError}
      />

      {data && data.totalPaginas > 1 && (
        <PaginadorPedidos
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
