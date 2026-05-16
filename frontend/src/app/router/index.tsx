import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AppLayout } from '@/app/layouts/AppLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { RutaProtegida } from '@/shared/components/RutaProtegida';
import { RutaConPermiso } from '@/shared/components/RutaConPermiso';
import { PaginaSinPermiso } from '@/shared/components/PaginaSinPermiso';
import { ModuloEnConstruccion } from '@/shared/components/ModuloEnConstruccion';
import { CatalogoPage }     from '@/features/catalogo/pages/CatalogoPage';
import { ClientesPage }     from '@/features/catalogo/pages/ClientesPage';
import { ItemsPage }        from '@/features/catalogo/pages/ItemsPage';
import { ProveedoresPage }  from '@/features/catalogo/pages/ProveedoresPage';
import { MaquinasPage }     from '@/features/catalogo/pages/MaquinasPage';
import { UbicacionesPage }  from '@/features/catalogo/pages/UbicacionesPage';

function RaizRedireccion() {
  const token = useAuthStore((s) => s.accessToken);
  return <Navigate to={token ? '/dashboard' : '/login'} replace />;
}

export function Enrutador() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/403"   element={<PaginaSinPermiso />} />
      <Route path="/"      element={<RaizRedireccion />} />

      {/* Protegidas — requieren JWT válido */}
      <Route element={<RutaProtegida />}>
        <Route element={<AppLayout />}>

          {/* Dashboard requiere permiso dashboard.ver */}
          <Route element={<RutaConPermiso permiso="dashboard.ver" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Catálogo — requiere permiso catalogo.ver */}
          <Route element={<RutaConPermiso permiso="catalogo.ver" />}>
            <Route path="/catalogo"                element={<CatalogoPage />} />
            <Route path="/catalogo/clientes"       element={<ClientesPage />} />
            <Route path="/catalogo/items"          element={<ItemsPage />} />
            <Route path="/catalogo/proveedores"    element={<ProveedoresPage />} />
            <Route path="/catalogo/maquinas"       element={<MaquinasPage />} />
            <Route path="/catalogo/ubicaciones"    element={<UbicacionesPage />} />
          </Route>

          {/* Módulos en construcción — solo JWT por ahora */}
          <Route path="/pedidos"        element={<ModuloEnConstruccion nombre="Pedidos" />} />
          <Route path="/produccion"     element={<ModuloEnConstruccion nombre="Producción" />} />
          <Route path="/abastecimiento" element={<ModuloEnConstruccion nombre="Abastecimiento" />} />
          <Route path="/despacho"       element={<ModuloEnConstruccion nombre="Despacho" />} />
          <Route path="/pqrs"           element={<ModuloEnConstruccion nombre="PQRS" />} />
          <Route path="/reportes"       element={<ModuloEnConstruccion nombre="Reportes" />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
