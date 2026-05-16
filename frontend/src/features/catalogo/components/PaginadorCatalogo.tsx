import { Button } from '@/shared/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  pagina: number;
  totalPaginas: number;
  total: number;
  limite: number;
  onCambiar: (p: number) => void;
}

export function PaginadorCatalogo({ pagina, totalPaginas, total, limite, onCambiar }: Props) {
  const inicio = (pagina - 1) * limite + 1;
  const fin    = Math.min(pagina * limite, total);

  return (
    <div className="flex items-center justify-between px-1 pt-2 text-sm text-muted-foreground">
      <span>{total === 0 ? 'Sin resultados' : `${inicio}–${fin} de ${total}`}</span>
      <div className="flex gap-1">
        <Button
          variant="outline" size="sm"
          disabled={pagina <= 1}
          onClick={() => onCambiar(pagina - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline" size="sm"
          disabled={pagina >= totalPaginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
