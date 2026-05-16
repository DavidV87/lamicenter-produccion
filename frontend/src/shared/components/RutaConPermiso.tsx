import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/auth.store';

interface Props {
  permiso: string;
}

export function RutaConPermiso({ permiso }: Props) {
  const tienePermiso = useAuthStore((s) => s.tienePermiso);
  if (!tienePermiso(permiso)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
