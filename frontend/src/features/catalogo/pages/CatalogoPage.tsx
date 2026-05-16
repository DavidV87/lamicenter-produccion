import { Link } from 'react-router-dom';
import { Users, Package, Truck, Settings, MapPin } from 'lucide-react';

const SECCIONES = [
  { to: '/catalogo/clientes',    icono: Users,    titulo: 'Clientes',    desc: 'Empresas y personas que realizan pedidos' },
  { to: '/catalogo/items',       icono: Package,  titulo: 'Ítems',       desc: 'Productos, materiales y servicios del portafolio' },
  { to: '/catalogo/proveedores', icono: Truck,    titulo: 'Proveedores', desc: 'Empresas que suministran materiales o servicios' },
  { to: '/catalogo/maquinas',    icono: Settings, titulo: 'Máquinas',    desc: 'Equipos de producción registrados por sede' },
  { to: '/catalogo/ubicaciones', icono: MapPin,   titulo: 'Ubicaciones', desc: 'Bodegas y espacios físicos de almacenamiento' },
];

export function CatalogoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <p className="text-sm text-muted-foreground">Gestión de entidades maestras del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map(({ to, icono: Icono, titulo, desc }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col gap-3 rounded-lg border border-marca-gris/50 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-marca-primario/10 text-marca-primario group-hover:bg-marca-primario group-hover:text-white transition-colors">
                <Icono className="h-5 w-5" />
              </div>
              <span className="font-semibold">{titulo}</span>
            </div>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
