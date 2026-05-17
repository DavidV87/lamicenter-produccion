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
import { PedidosPage }      from '@/features/pedidos/pages/PedidosPage';
import { NuevoPedidoPage }  from '@/features/pedidos/pages/NuevoPedidoPage';
import { PedidoDetallePage } from '@/features/pedidos/pages/PedidoDetallePage';
import { OrdenesProduccionPage }     from '@/features/produccion/pages/OrdenesProduccionPage';
import { NuevaOrdenProduccionPage }  from '@/features/produccion/pages/NuevaOrdenProduccionPage';
import { OrdenProduccionDetallePage } from '@/features/produccion/pages/OrdenProduccionDetallePage';
import { AbastecimientoPage }        from '@/features/abastecimiento/pages/AbastecimientoPage';
import { RequerimientosPage }        from '@/features/abastecimiento/pages/RequerimientosPage';
import { NuevoRequerimientoPage }    from '@/features/abastecimiento/pages/NuevoRequerimientoPage';
import { RequerimientoDetallePage }  from '@/features/abastecimiento/pages/RequerimientoDetallePage';
import { SolicitudesCompraPage }     from '@/features/abastecimiento/pages/SolicitudesCompraPage';
import { NuevaSolicitudCompraPage }  from '@/features/abastecimiento/pages/NuevaSolicitudCompraPage';
import { SolicitudCompraDetallePage } from '@/features/abastecimiento/pages/SolicitudCompraDetallePage';
import { DespachoPage }             from '@/features/despacho/pages/DespachoPage';
import { DespachosPage }            from '@/features/despacho/pages/DespachosPage';
import { NuevoDespachoPage }        from '@/features/despacho/pages/NuevoDespachoPage';
import { DespachoDetallePage }      from '@/features/despacho/pages/DespachoDetallePage';
import { UbicacionPedidoPage }      from '@/features/despacho/pages/UbicacionPedidoPage';

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

          {/* Dashboard */}
          <Route element={<RutaConPermiso permiso="dashboard.ver" />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Catálogo */}
          <Route element={<RutaConPermiso permiso="catalogo.ver" />}>
            <Route path="/catalogo"                element={<CatalogoPage />} />
            <Route path="/catalogo/clientes"       element={<ClientesPage />} />
            <Route path="/catalogo/items"          element={<ItemsPage />} />
            <Route path="/catalogo/proveedores"    element={<ProveedoresPage />} />
            <Route path="/catalogo/maquinas"       element={<MaquinasPage />} />
            <Route path="/catalogo/ubicaciones"    element={<UbicacionesPage />} />
          </Route>

          {/* Pedidos */}
          <Route element={<RutaConPermiso permiso="pedidos.ver" />}>
            <Route path="/pedidos"        element={<PedidosPage />} />
            <Route path="/pedidos/:id"    element={<PedidoDetallePage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="pedidos.crear" />}>
            <Route path="/pedidos/nuevo" element={<NuevoPedidoPage />} />
          </Route>

          {/* Producción */}
          <Route element={<RutaConPermiso permiso="produccion.ver" />}>
            <Route path="/produccion/ordenes"     element={<OrdenesProduccionPage />} />
            <Route path="/produccion/ordenes/:id" element={<OrdenProduccionDetallePage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="produccion.crear" />}>
            <Route path="/produccion/ordenes/nueva" element={<NuevaOrdenProduccionPage />} />
          </Route>
          <Route path="/produccion" element={<Navigate to="/produccion/ordenes" replace />} />

          {/* Abastecimiento */}
          <Route path="/abastecimiento" element={<AbastecimientoPage />} />
          <Route element={<RutaConPermiso permiso="abastecimiento.ver" />}>
            <Route path="/abastecimiento/requerimientos"     element={<RequerimientosPage />} />
            <Route path="/abastecimiento/requerimientos/:id" element={<RequerimientoDetallePage />} />
            <Route path="/abastecimiento/solicitudes-compra"     element={<SolicitudesCompraPage />} />
            <Route path="/abastecimiento/solicitudes-compra/:id" element={<SolicitudCompraDetallePage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="abastecimiento.crear" />}>
            <Route path="/abastecimiento/requerimientos/nuevo"      element={<NuevoRequerimientoPage />} />
            <Route path="/abastecimiento/solicitudes-compra/nueva"  element={<NuevaSolicitudCompraPage />} />
          </Route>

          {/* Despacho */}
          <Route path="/despacho" element={<DespachoPage />} />
          <Route element={<RutaConPermiso permiso="despacho.ver" />}>
            <Route path="/despacho/despachos"     element={<DespachosPage />} />
            <Route path="/despacho/despachos/:id" element={<DespachoDetallePage />} />
            <Route path="/despacho/ubicacion-pedido/:pedidoId" element={<UbicacionPedidoPage />} />
          </Route>
          <Route element={<RutaConPermiso permiso="despacho.crear" />}>
            <Route path="/despacho/despachos/nuevo" element={<NuevoDespachoPage />} />
          </Route>
          <Route path="/pqrs"     element={<ModuloEnConstruccion nombre="PQRS" />} />
          <Route path="/reportes" element={<ModuloEnConstruccion nombre="Reportes" />} />

        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
