import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { AppLayout } from '@/app/layouts/AppLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { RutaProtegida } from '@/shared/components/RutaProtegida';
import { RutaConPermiso } from '@/shared/components/RutaConPermiso';
import { PaginaSinPermiso } from '@/shared/components/PaginaSinPermiso';
import { ModuloEnConstruccion } from '@/shared/components/ModuloEnConstruccion';

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

          {/* Módulos en construcción — solo JWT por ahora */}
          <Route path="/pedidos"        element={<ModuloEnConstruccion nombre="Pedidos" />} />
          <Route path="/produccion"     element={<ModuloEnConstruccion nombre="Producción" />} />
          <Route path="/abastecimiento" element={<ModuloEnConstruccion nombre="Abastecimiento" />} />
          <Route path="/despacho"       element={<ModuloEnConstruccion nombre="Despacho" />} />
          <Route path="/pqrs"           element={<ModuloEnConstruccion nombre="PQRS" />} />
          <Route path="/catalogo"       element={<ModuloEnConstruccion nombre="Catálogo" />} />
          <Route path="/reportes"       element={<ModuloEnConstruccion nombre="Reportes" />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
