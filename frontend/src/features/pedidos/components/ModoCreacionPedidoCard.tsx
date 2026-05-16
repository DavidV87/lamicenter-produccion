import { FileText, FileScan } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface Props {
  onSeleccionarManual: () => void;
}

export function ModoCreacionPedidoCard({ onSeleccionarManual }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
      {/* Tarjeta manual — habilitada */}
      <Card
        className="flex flex-col items-center gap-4 p-8 cursor-pointer border-2 hover:border-primary transition-colors"
        onClick={onSeleccionarManual}
      >
        <FileText className="h-10 w-10 text-[#636620]" />
        <div className="text-center">
          <h3 className="font-semibold text-lg">Crear pedido manual</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ingresa el pedido ítem por ítem
          </p>
        </div>
        <Button className="w-full" onClick={onSeleccionarManual}>
          Continuar
        </Button>
      </Card>

      {/* Tarjeta PDF — deshabilitada */}
      <Card className="flex flex-col items-center gap-4 p-8 border-2 border-dashed opacity-60 select-none">
        <FileScan className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-semibold text-lg">Cargar desde factura PDF</h3>
            <Badge variant="secondary" className="text-xs">Próximamente</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Carga automática mediante reconocimiento de documentos
          </p>
        </div>
        <Button className="w-full" disabled>
          No disponible
        </Button>
      </Card>
    </div>
  );
}
