import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  usePqrsDetalle,
  useSeguimientosPqrs,
  useEvidenciasPqrs,
  useResponsablesPqrs,
} from '../hooks/usePqrs';
import { EstadoPqrsBadge } from '../components/EstadoPqrsBadge';
import { SeguimientosTimeline } from '../components/SeguimientosTimeline';
import { EvidenciasPqrsTable } from '../components/EvidenciasPqrsTable';
import { ResponsablesPqrsTable } from '../components/ResponsablesPqrsTable';
import { CambiarEstadoPqrsDialog } from '../components/CambiarEstadoPqrsDialog';
import { SeguimientoPqrsForm } from '../forms/SeguimientoPqrsForm';
import { EvidenciaPqrsForm } from '../forms/EvidenciaPqrsForm';
import { ResponsablePqrsForm } from '../forms/ResponsablePqrsForm';

export function PqrsDetallePage() {
  const { id = '' } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const [dialogEstado,      setDialogEstado]      = useState(false);
  const [mostrarSeguimiento, setMostrarSeguimiento] = useState(false);
  const [mostrarEvidencia,   setMostrarEvidencia]   = useState(false);
  const [mostrarResponsable, setMostrarResponsable] = useState(false);

  const { data: pqrs, isLoading, error } = usePqrsDetalle(id);
  const { data: seguimientos, isLoading: cargandoSeg } = useSeguimientosPqrs(id);
  const { data: evidencias,   isLoading: cargandoEv  } = useEvidenciasPqrs(id);
  const { data: responsables, isLoading: cargandoRes } = useResponsablesPqrs(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !pqrs) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {(error as Error)?.message ?? 'No se encontró la PQRS.'}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <Link
            to="/pqrs/listado"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Volver al listado
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            PQRS {pqrs.consecutivo}
          </h1>
          <p className="text-muted-foreground">{pqrs.cliente.razonSocial}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <EstadoPqrsBadge codigo={pqrs.estadoPqrs.codigo} nombre={pqrs.estadoPqrs.nombre} />
          {tienePermiso('pqrs.cambiar_estado') && (
            <Button size="sm" variant="outline" onClick={() => setDialogEstado(true)}>
              <RefreshCw size={14} className="mr-1.5" />
              Cambiar estado
            </Button>
          )}
        </div>
      </div>

      {/* Info general */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Tipo de novedad</p>
            <p className="font-medium">{pqrs.tipoNovedad.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Responsable de solución</p>
            <p className="font-medium">{pqrs.responsableSolucion?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Genera reproceso</p>
            <p className="font-medium">{pqrs.generaReproceso ? 'Sí' : 'No'}</p>
          </div>
          {pqrs.costoEstimado != null && (
            <div>
              <p className="text-xs text-muted-foreground">Costo estimado</p>
              <p className="font-medium">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(pqrs.costoEstimado)}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Creado por</p>
            <p className="font-medium">{pqrs.creadoPor.nombre}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha de creación</p>
            <p className="font-medium">{new Date(pqrs.creadoEn).toLocaleDateString('es-CO')}</p>
          </div>
          {pqrs.pedidoId && (
            <div>
              <p className="text-xs text-muted-foreground">Pedido</p>
              <Link
                to={`/pedidos/${pqrs.pedidoId}`}
                className="font-medium text-marca-primario hover:underline"
              >
                Ver pedido →
              </Link>
            </div>
          )}
          {pqrs.ordenProduccionId && (
            <div>
              <p className="text-xs text-muted-foreground">Orden de producción</p>
              <Link
                to={`/produccion/ordenes/${pqrs.ordenProduccionId}`}
                className="font-medium text-marca-primario hover:underline"
              >
                Ver orden →
              </Link>
            </div>
          )}
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-muted-foreground">Descripción</p>
            <p className="whitespace-pre-wrap">{pqrs.descripcion}</p>
          </div>
          {pqrs.solucionAplicada && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-muted-foreground">Solución aplicada</p>
              <p className="whitespace-pre-wrap">{pqrs.solucionAplicada}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seguimientos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Seguimientos</CardTitle>
          {tienePermiso('pqrs.editar') && !mostrarSeguimiento && (
            <Button size="sm" variant="outline" onClick={() => setMostrarSeguimiento(true)}>
              Agregar seguimiento
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mostrarSeguimiento ? (
            <SeguimientoPqrsForm
              pqrsId={id}
              onExito={() => setMostrarSeguimiento(false)}
              onCancelar={() => setMostrarSeguimiento(false)}
            />
          ) : (
            <SeguimientosTimeline seguimientos={seguimientos} cargando={cargandoSeg} />
          )}
        </CardContent>
      </Card>

      {/* Evidencias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Evidencias</CardTitle>
          {tienePermiso('pqrs.editar') && !mostrarEvidencia && (
            <Button size="sm" variant="outline" onClick={() => setMostrarEvidencia(true)}>
              Agregar evidencia
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mostrarEvidencia ? (
            <EvidenciaPqrsForm
              pqrsId={id}
              onExito={() => setMostrarEvidencia(false)}
              onCancelar={() => setMostrarEvidencia(false)}
            />
          ) : (
            <EvidenciasPqrsTable evidencias={evidencias} cargando={cargandoEv} />
          )}
        </CardContent>
      </Card>

      {/* Responsables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Responsables</CardTitle>
          {tienePermiso('pqrs.editar') && !mostrarResponsable && (
            <Button size="sm" variant="outline" onClick={() => setMostrarResponsable(true)}>
              Asignar responsable
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mostrarResponsable ? (
            <ResponsablePqrsForm
              pqrsId={id}
              onExito={() => setMostrarResponsable(false)}
              onCancelar={() => setMostrarResponsable(false)}
            />
          ) : (
            <ResponsablesPqrsTable responsables={responsables} cargando={cargandoRes} />
          )}
        </CardContent>
      </Card>

      <CambiarEstadoPqrsDialog
        pqrsId={id}
        abierto={dialogEstado}
        onCerrar={() => setDialogEstado(false)}
      />
    </div>
  );
}
