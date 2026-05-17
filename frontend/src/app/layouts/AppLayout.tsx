import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Factory, Truck, ShoppingCart,
  MessageSquare, BookOpen, BarChart2, LogOut, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

const MENU = [
  { a: '/dashboard',      etiqueta: 'Dashboard',     Icono: LayoutDashboard },
  { a: '/pedidos',        etiqueta: 'Pedidos',        Icono: Package         },
  { a: '/produccion/ordenes', etiqueta: 'Producción', Icono: Factory         },
  { a: '/abastecimiento/requerimientos', etiqueta: 'Abastecimiento', Icono: ShoppingCart },
  { a: '/despacho/despachos', etiqueta: 'Despacho',    Icono: Truck           },
  { a: '/pqrs/listado',   etiqueta: 'PQRS',           Icono: MessageSquare   },
  { a: '/catalogo',       etiqueta: 'Catálogo',       Icono: BookOpen        },
  { a: '/reportes',       etiqueta: 'Reportes',       Icono: BarChart2       },
];

export function AppLayout() {
  const [sidebarAbierto, setSidebarAbierto] = useState(false);
  const usuario    = useAuthStore((s) => s.usuario);
  const cerrarSesion = useAuthStore((s) => s.cerrarSesion);
  const navegar    = useNavigate();

  function salir() {
    cerrarSesion();
    navegar('/login', { replace: true });
  }

  const iniciales = usuario?.nombre
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase() ?? 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* ── Overlay móvil ───────────────────────────────────────────────── */}
      {sidebarAbierto && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarAbierto(false)}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR — fondo negro, texto blanco, acento verde oliva           */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex w-60 flex-col bg-marca-negro transition-transform duration-200',
          'lg:relative lg:translate-x-0',
          sidebarAbierto ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {/* Marca */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <span className="font-poppins text-base font-extrabold tracking-widest text-white">
            LAMICENTER
          </span>
          <button
            className="text-white/50 hover:text-white lg:hidden"
            onClick={() => setSidebarAbierto(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Separador dorado delgado */}
        <div className="h-0.5 shrink-0 bg-marca-dorado/60" />

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {MENU.map(({ a, etiqueta, Icono }) => (
            <NavLink
              key={a}
              to={a}
              onClick={() => setSidebarAbierto(false)}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-marca-primario text-white'
                    : 'text-white/60 hover:bg-white/8 hover:text-white',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <Icono
                    size={17}
                    className={isActive ? 'text-white' : 'text-white/50 group-hover:text-white'}
                  />
                  <span>{etiqueta}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Usuario */}
        <div className="shrink-0 border-t border-white/10 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded px-2 py-2 text-left hover:bg-white/8 transition-colors">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-marca-primario text-white text-xs font-semibold">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-white">{usuario?.nombre}</p>
                  <p className="truncate text-xs text-white/50 capitalize">{usuario?.rol}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-semibold text-foreground">{usuario?.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{usuario?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={salir}
                className="text-marca-rojo focus:text-marca-rojo focus:bg-marca-rojo/10 cursor-pointer"
              >
                <LogOut size={14} className="mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* CONTENIDO PRINCIPAL                                               */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar — blanca con borde gris */}
        <header className="flex h-16 shrink-0 items-center border-b border-marca-gris bg-white px-4 lg:px-6">
          {/* Botón hamburguesa (móvil) */}
          <button
            className="mr-3 text-marca-negro/60 hover:text-marca-negro lg:hidden"
            onClick={() => setSidebarAbierto(true)}
          >
            <Menu size={22} />
          </button>

          <div className="flex flex-1 items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Control de producción
            </span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              {new Date().toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Área de página */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
