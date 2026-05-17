import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import { pedidosServicio } from '@/features/pedidos/services/pedidos.servicio';
import type { CrearOrdenProduccionPayload } from '../types/produccion.types';

const esquema = z.object({
  pedidoId:            z.string().min(1, 'Selecciona un pedido'),
  sedeProduccionId:    z.string().min(1, 'Selecciona sede de producción'),
  sedeActualId:        z.string().min(1, 'Selecciona sede actual'),
  sedeDespachoId:      z.string().optional(),
  maquinaPrincipalId:  z.string().optional(),
  ordenPrioridad:      z.number().min(0, 'Mínimo 0').optional(),
  fechaInicioPlaneada: z.string().optional(),
  fechaFinPlaneada:    z.string().optional(),
  observaciones:       z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  onSubmit: (payload: CrearOrdenProduccionPayload) => void;
  cargando?: boolean;
}

export function OrdenProduccionForm({ onSubmit, cargando }: Props) {
  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  const { data: maquinas, isLoading: cargandoMaquinas } = useQuery({
    queryKey: ['maquinas-referencia'],
    queryFn: () => catalogoServicio.listarMaquinas({ limite: 200 }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  const { data: pedidos, isLoading: cargandoPedidos } = useQuery({
    queryKey: ['pedidos-referencia'],
    queryFn: () => pedidosServicio.listar({ limite: 100 }).then((r) => r.datos),
    staleTime: 2 * 60_000,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      pedidoId: '', sedeProduccionId: '', sedeActualId: '',
      sedeDespachoId: '', maquinaPrincipalId: '',
      ordenPrioridad: 0, fechaInicioPlaneada: '', fechaFinPlaneada: '', observaciones: '',
    },
  });

  const pedidoId          = watch('pedidoId');
  const sedeProduccionId  = watch('sedeProduccionId');
  const sedeActualId      = watch('sedeActualId');
  const sedeDespachoId    = watch('sedeDespachoId');
  const maquinaId         = watch('maquinaPrincipalId');

  function enviar(campos: Campos) {
    onSubmit({
      pedidoId:            campos.pedidoId,
      sedeProduccionId:    campos.sedeProduccionId,
      sedeActualId:        campos.sedeActualId,
      sedeDespachoId:      campos.sedeDespachoId || undefined,
      maquinaPrincipalId:  campos.maquinaPrincipalId || undefined,
      ordenPrioridad:      campos.ordenPrioridad,
      fechaInicioPlaneada: campos.fechaInicioPlaneada || undefined,
      fechaFinPlaneada:    campos.fechaFinPlaneada || undefined,
      observaciones:       campos.observaciones || undefined,
    });
  }

  const cargandoRefs = cargandoSedes || cargandoMaquinas || cargandoPedidos;

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-6">

      {/* ── Pedido ──────────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-sm">Pedido de origen *</h3>
        <div className="space-y-1">
          {cargandoPedidos ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={pedidoId}
              onValueChange={(v) => setValue('pedidoId', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un pedido…" />
              </SelectTrigger>
              <SelectContent>
                {pedidos?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.consecutivo}
                    <span className="ml-1 text-xs text-muted-foreground">
                      — {p.cliente.razonSocial}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.pedidoId && (
            <p className="text-xs text-destructive">{errors.pedidoId.message}</p>
          )}
        </div>
      </section>

      {/* ── Sedes ───────────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-sm">Sedes</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <div className="space-y-1">
            <Label>Sede de producción *</Label>
            {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={sedeProduccionId}
                onValueChange={(v) => setValue('sedeProduccionId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {sedes?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.sedeProduccionId && (
              <p className="text-xs text-destructive">{errors.sedeProduccionId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Sede actual *</Label>
            {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={sedeActualId}
                onValueChange={(v) => setValue('sedeActualId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona…" />
                </SelectTrigger>
                <SelectContent>
                  {sedes?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.sedeActualId && (
              <p className="text-xs text-destructive">{errors.sedeActualId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Sede de despacho</Label>
            {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={sedeDespachoId ?? ''}
                onValueChange={(v) => setValue('sedeDespachoId', v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin sede…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin sede</SelectItem>
                  {sedes?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </section>

      {/* ── Máquina y configuración ──────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-3">
        <h3 className="font-semibold text-sm">Configuración</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="space-y-1">
            <Label>Máquina principal</Label>
            {cargandoMaquinas ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={maquinaId ?? ''}
                onValueChange={(v) => setValue('maquinaPrincipalId', v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin máquina…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin máquina</SelectItem>
                  {maquinas?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                      <span className="ml-1 text-xs text-muted-foreground">({m.codigo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1">
            <Label>Prioridad (0 = normal)</Label>
            <Input
              type="number"
              min={0}
              {...register('ordenPrioridad', { valueAsNumber: true })}
              placeholder="0"
            />
            {errors.ordenPrioridad && (
              <p className="text-xs text-destructive">{errors.ordenPrioridad.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Fecha inicio planeada</Label>
            <Input type="date" {...register('fechaInicioPlaneada')} />
          </div>

          <div className="space-y-1">
            <Label>Fecha fin planeada</Label>
            <Input type="date" {...register('fechaFinPlaneada')} />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Observaciones</Label>
          <Textarea {...register('observaciones')} placeholder="Notas de la orden…" rows={2} />
        </div>
      </section>

      <Button type="submit" disabled={cargando || cargandoRefs} className="w-full">
        {cargando ? 'Creando orden…' : 'Crear orden de producción'}
      </Button>
    </form>
  );
}
