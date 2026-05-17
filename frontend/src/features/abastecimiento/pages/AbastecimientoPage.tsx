import { Link } from 'react-router-dom';
import { ClipboardList, ShoppingCart, Package, RotateCcw, ArrowLeftRight, Boxes } from 'lucide-react';

const ACTIVAS = [
  {
    to: '/abastecimiento/requerimientos',
    Icono: ClipboardList,
    titulo: 'Requerimientos de material',
    desc: 'Solicitudes internas de materiales para producción y operaciones',
  },
  {
    to: '/abastecimiento/solicitudes-compra',
    Icono: ShoppingCart,
    titulo: 'Solicitudes de compra',
    desc: 'Órdenes de compra enviadas a proveedores',
  },
];

const PROXIMAMENTE = [
  { Icono: Package,        titulo: 'Compras',       desc: 'Gestión de órdenes de compra confirmadas' },
  { Icono: RotateCcw,      titulo: 'Recepciones',   desc: 'Registro de materiales recibidos' },
  { Icono: ArrowLeftRight, titulo: 'Traslados',      desc: 'Movimientos entre sedes' },
  { Icono: Boxes,          titulo: 'Inventario',     desc: 'Consulta y ajuste de stock' },
];

export function AbastecimientoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Abastecimiento</h1>
        <p className="text-sm text-muted-foreground">Gestión de materiales, compras e inventario</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIVAS.map(({ to, Icono, titulo, desc }) => (
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

      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Próximamente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROXIMAMENTE.map(({ Icono, titulo, desc }) => (
            <div
              key={titulo}
              className="relative flex flex-col gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50 p-5 opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 text-gray-400">
                  <Icono className="h-5 w-5" />
                </div>
                <span className="font-semibold text-gray-500">{titulo}</span>
              </div>
              <p className="text-sm text-gray-400">{desc}</p>
              <span className="absolute right-3 top-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                Próximamente
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
