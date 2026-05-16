import { AlertCircle, RefreshCw } from 'lucide-react';
import { useResumenGeneral } from '../hooks/useResumenGeneral';
import { useActividadReciente } from '../hooks/useActividadReciente';
import { TarjetasKPI } from '../components/TarjetasKPI';
import { ListaActividadReciente } from '../components/ListaActividadReciente';

function ErrorConexion({ onReintentar }: { onReintentar: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-marca-rojo/30 bg-marca-rojo/5 p-10 text-center">
      <AlertCircle size={36} className="text-marca-rojo" />
      <div>
        <p className="font-semibold text-marca-rojo">No se puede conectar con el servidor</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Verifica que el backend esté corriendo en{' '}
          <code className="rounded bg-background px-1 py-0.5 text-xs font-mono">
            http://localhost:3000
          </code>
        </p>
      </div>
      <button
        onClick={onReintentar}
        className="flex items-center gap-2 rounded border border-marca-rojo/40 px-4 py-2 text-sm font-medium text-marca-rojo hover:bg-marca-rojo/10 transition-colors"
      >
        <RefreshCw size={14} />
        Reintentar
      </button>
    </div>
  );
}

export function DashboardPage() {
  const resumen   = useResumenGeneral();
  const actividad = useActividadReciente();

  const hayError = resumen.isError || actividad.isError;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-marca-negro font-poppins">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Vista general del sistema en tiempo real
          </p>
        </div>
        {resumen.data && (
          <p className="text-xs text-muted-foreground whitespace-nowrap pt-1">
            Actualizado:{' '}
            <span className="font-medium">
              {new Date(resumen.data.generadoEn).toLocaleTimeString('es-CO')}
            </span>
          </p>
        )}
      </div>

      {/* Error de conexión */}
      {hayError && !resumen.isFetching && !actividad.isFetching && (
        <ErrorConexion
          onReintentar={() => {
            void resumen.refetch();
            void actividad.refetch();
          }}
        />
      )}

      {/* KPIs */}
      <TarjetasKPI resumen={resumen.data} cargando={resumen.isLoading} />

      {/* Actividad reciente */}
      <ListaActividadReciente items={actividad.data} cargando={actividad.isLoading} />
    </div>
  );
}
