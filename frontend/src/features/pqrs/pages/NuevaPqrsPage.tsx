import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { PqrsForm } from '../forms/PqrsForm';
import { AdvertenciaDuplicadoAlert } from '../components/AdvertenciaDuplicadoAlert';

export function NuevaPqrsPage() {
  const navegar = useNavigate();
  const [advertencias, setAdvertencias] = useState<string[]>([]);

  function handleExito(pqrsId: string, advertenciasRecibidas: string[]) {
    if (advertenciasRecibidas.length > 0) {
      setAdvertencias(advertenciasRecibidas);
      setTimeout(() => navegar(`/pqrs/${pqrsId}`), 2000);
    } else {
      navegar(`/pqrs/${pqrsId}`);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          to="/pqrs/listado"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} />
          Volver al listado
        </Link>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Nueva PQRS</h1>

      {advertencias.length > 0 && (
        <AdvertenciaDuplicadoAlert advertencias={advertencias} />
      )}

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-base">Datos de la PQRS</CardTitle>
        </CardHeader>
        <CardContent>
          <PqrsForm onExito={handleExito} />
        </CardContent>
      </Card>
    </div>
  );
}
