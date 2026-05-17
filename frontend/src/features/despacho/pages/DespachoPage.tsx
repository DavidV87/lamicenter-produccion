import { Link } from 'react-router-dom';
import { Truck, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const TARJETAS_ACTIVAS = [
  {
    titulo:    'Despachos',
    descripcion: 'Gestionar y dar seguimiento a los despachos de pedidos.',
    Icono:     Truck,
    enlace:    '/despacho/despachos',
  },
  {
    titulo:    'Ubicación de pedidos',
    descripcion: 'Consultar y actualizar la ubicación física de cada pedido.',
    Icono:     MapPin,
    enlace:    '/despacho/ubicacion-pedido',
  },
];

export function DespachoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Despacho</h1>
        <p className="text-muted-foreground">Módulo de gestión de despachos y ubicación de pedidos.</p>
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
      </div>
    </div>
  );
}
