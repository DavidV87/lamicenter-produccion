import { useNavigate } from 'react-router-dom';
import { ShieldOff } from 'lucide-react';

export function PaginaSinPermiso() {
  const navegar = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-marca-rojo/30 bg-marca-rojo/8">
        <ShieldOff size={28} className="text-marca-rojo" />
      </div>
      <h1 className="text-6xl font-extrabold text-marca-negro font-poppins">403</h1>
      <p className="mt-3 text-base font-medium text-foreground">Acceso denegado</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        No tienes permisos para acceder a esta sección del sistema.
      </p>
      <button
        onClick={() => navegar('/dashboard')}
        className="mt-6 rounded bg-marca-primario px-5 py-2.5 text-sm font-semibold text-white hover:bg-marca-primario/90 transition-colors"
      >
        Volver al Dashboard
      </button>
    </div>
  );
}
