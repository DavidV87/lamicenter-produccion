import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DespachoForm } from '../forms/DespachoForm';

export function NuevoDespachoPage() {
  const navegar = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/despacho/despachos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Volver a despachos
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Nuevo despacho</h1>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Datos del despacho</CardTitle>
        </CardHeader>
        <CardContent>
          <DespachoForm onExito={(id) => navegar(`/despacho/despachos/${id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
