import { Link } from 'react-router-dom';
import { MessageSquare, Plus, BarChart2, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const TARJETAS_ACTIVAS = [
  {
    titulo:      'Listado PQRS',
    descripcion: 'Ver y gestionar todas las PQRS registradas.',
    Icono:       MessageSquare,
    enlace:      '/pqrs/listado',
  },
  {
    titulo:      'Nueva PQRS',
    descripcion: 'Registrar una nueva novedad, queja, reclamo o solicitud.',
    Icono:       Plus,
    enlace:      '/pqrs/nueva',
  },
];

const TARJETAS_PROXIMAS = [
  { titulo: 'Métricas PQRS', Icono: BarChart2 },
  { titulo: 'SLA y tiempos', Icono: Clock },
  { titulo: 'Reportes PQRS', Icono: FileText },
];

export function PqrsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">PQRS</h1>
        <p className="text-muted-foreground">
          Módulo de gestión de peticiones, quejas, reclamos y solicitudes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TARJETAS_ACTIVAS.map(({ titulo, descripcion, Icono, enlace }) => (
          <Link key={enlace} to={enlace}>
            <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-marca-primario/10 p-2">
                    <Icono size={20} className="text-marca-primario" />
                  </div>
                  <CardTitle className="text-base">{titulo}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{descripcion}</p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {TARJETAS_PROXIMAS.map(({ titulo, Icono }) => (
          <Card
            key={titulo}
            className="h-full cursor-not-allowed border-dashed opacity-60"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icono size={20} className="text-muted-foreground" />
                </div>
                <CardTitle className="text-base">{titulo}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center rounded-full border border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground">
                Próximamente
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
