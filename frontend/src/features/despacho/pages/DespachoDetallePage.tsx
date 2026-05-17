import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
  useDespachoDetalle,
  useChecklistDespacho,
  useEvidenciasDespacho,
} from '../hooks/useDespacho';
import { EstadoDespachoBadge } from '../components/EstadoDespachoBadge';
import { ChecklistDespachoTable } from '../components/ChecklistDespachoTable';
import { EvidenciasDespachoTable } from '../components/EvidenciasDespachoTable';
import { CambiarEstadoDespachoDialog } from '../components/CambiarEstadoDespachoDialog';
import { ChecklistDespachoForm } from '../forms/ChecklistDespachoForm';
import { EvidenciaDespachoForm } from '../forms/EvidenciaDespachoForm';

export function DespachoDetallePage() {
  const { id = '' } = useParams<{ id: string }>();
  const tienePermiso = useAuthStore((s) => s.tienePermiso);

  const [dialogEstado,    setDialogEstado]    = useState(false);
  const [mostrarChecklist, setMostrarChecklist] = useState(false);
  const [mostrarEvidencia, setMostrarEvidencia] = useState(false);

  const { data: despacho, isLoading, error } = useDespachoDetalle(id);
  const { data: checklist, isLoading: cargandoCl } = useChecklistDespacho(id);
  const { data: evidencias, isLoading: cargandoEv } = useEvidenciasDespacho(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !despacho) {
    return (
      <p className="py-8 text-center text-sm text-destructive">
        {(error as Error)?.message ?? 'No se encontró el despacho.'}
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/despacho/despachos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={15} />
            Volver a despachos
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Despacho — Pedido {despacho.pedido.consecutivo}
          </h1>
          <p className="text-muted-foreground">{despacho.pedido.cliente.razonSocial}</p>
        </div>

        <div className="flex items-center gap-2">
          <EstadoDespachoBadge codigo={despacho.estado.codigo} nombre={despacho.estado.nombre} />
          {tienePermiso('despacho.editar') && (
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
          <CardTitle className="text-base">Información del despacho</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Sede de salida</p>
            <p className="font-medium">{despacho.sedeSalida?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Encargado</p>
            <p className="font-medium">{despacho.encargadoDespacho?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fecha programada</p>
            <p className="font-medium">
              {despacho.fechaProgramada
                ? new Date(despacho.fechaProgramada).toLocaleDateString('es-CO')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Autorizado por</p>
            <p className="font-medium">{despacho.autorizadoPor?.nombre ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Creado</p>
            <p className="font-medium">{new Date(despacho.creadoEn).toLocaleDateString('es-CO')}</p>
          </div>
          {despacho.observaciones && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Observaciones</p>
              <p>{despacho.observaciones}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Checklist de despacho</CardTitle>
          {tienePermiso('despacho.editar') && !checklist && !cargandoCl && !mostrarChecklist && (
            <Button size="sm" variant="outline" onClick={() => setMostrarChecklist(true)}>
              Registrar checklist
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mostrarChecklist ? (
            <ChecklistDespachoForm
              despachoId={id}
              onExito={() => setMostrarChecklist(false)}
              onCancelar={() => setMostrarChecklist(false)}
            />
          ) : (
            <ChecklistDespachoTable checklist={checklist} cargando={cargandoCl} />
          )}
        </CardContent>
      </Card>

      {/* Evidencias */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Evidencias</CardTitle>
          {tienePermiso('despacho.editar') && !mostrarEvidencia && (
            <Button size="sm" variant="outline" onClick={() => setMostrarEvidencia(true)}>
              Agregar evidencia
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {mostrarEvidencia ? (
            <EvidenciaDespachoForm
              despachoId={id}
              onExito={() => setMostrarEvidencia(false)}
              onCancelar={() => setMostrarEvidencia(false)}
            />
          ) : (
            <EvidenciasDespachoTable evidencias={evidencias} cargando={cargandoEv} />
          )}
        </CardContent>
      </Card>

      {/* Link a ubicación */}
      <div className="text-sm">
        <Link
          to={`/despacho/ubicacion-pedido/${despacho.pedido.id}`}
          className="text-marca-primario hover:underline"
        >
          Ver / actualizar ubicación del pedido →
        </Link>
      </div>

      {/* Dialogs */}
      <CambiarEstadoDespachoDialog
        despachoId={id}
        abierto={dialogEstado}
        onCerrar={() => setDialogEstado(false)}
      />
    </div>
  );
}
