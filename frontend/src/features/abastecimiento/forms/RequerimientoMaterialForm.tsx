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
import type { CrearRequerimientoPayload } from '../types/abastecimiento.types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  itemId:             z.string().min(1, 'Selecciona un ítem'),
  sedeId:             z.string().min(1, 'Selecciona una sede'),
  cantidadRequerida:  z.number({ invalid_type_error: 'Ingresa una cantidad' }).positive('Debe ser mayor a 0'),
  tipoRequerimiento:  z.enum(['GENERAL', 'PEDIDO', 'PRODUCCION', 'MANTENIMIENTO']).optional(),
  pedidoId:           z.string().regex(UUID_REGEX, 'UUID inválido').optional().or(z.literal('')),
  ordenProduccionId:  z.string().regex(UUID_REGEX, 'UUID inválido').optional().or(z.literal('')),
  fechaNecesaria:     z.string().optional(),
  observaciones:      z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  onSubmit: (payload: CrearRequerimientoPayload) => void;
  cargando?: boolean;
}

export function RequerimientoMaterialForm({ onSubmit, cargando }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      itemId: '', sedeId: '', cantidadRequerida: 1,
      tipoRequerimiento: 'GENERAL',
      pedidoId: '', ordenProduccionId: '', fechaNecesaria: '', observaciones: '',
    },
  });

  const itemId            = watch('itemId');
  const sedeId            = watch('sedeId');
  const tipoRequerimiento = watch('tipoRequerimiento');

  const { data: items, isLoading: cargandoItems } = useQuery({
    queryKey: ['items-referencia'],
    queryFn: () => catalogoServicio.listarItems({ limite: 200, activo: true }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  function enviar(campos: Campos) {
    onSubmit({
      itemId:            campos.itemId,
      sedeId:            campos.sedeId,
      cantidadRequerida: campos.cantidadRequerida,
      tipoRequerimiento: campos.tipoRequerimiento,
      pedidoId:          campos.pedidoId || undefined,
      ordenProduccionId: campos.ordenProduccionId || undefined,
      fechaNecesaria:    campos.fechaNecesaria || undefined,
      observaciones:     campos.observaciones || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-6">

      {/* ── Ítem y sede ─────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold text-sm">Material requerido</h3>

        <div className="space-y-1">
          <Label>Ítem / Material *</Label>
          {cargandoItems ? <Skeleton className="h-9 w-full" /> : (
            <Select
              value={itemId}
              onValueChange={(v) => setValue('itemId', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ítem…" />
              </SelectTrigger>
              <SelectContent>
                {items?.map((it) => (
                  <SelectItem key={it.id} value={it.id}>
                    {it.nombre}
                    <span className="ml-1 text-xs text-muted-foreground">({it.codigo})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.itemId && <p className="text-xs text-destructive">{errors.itemId.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Sede que solicita *</Label>
            {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={sedeId}
                onValueChange={(v) => setValue('sedeId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una sede…" />
                </SelectTrigger>
                <SelectContent>
                  {sedes?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.sedeId && <p className="text-xs text-destructive">{errors.sedeId.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Cantidad requerida *</Label>
            <Input
              type="number"
              min={1}
              step="any"
              {...register('cantidadRequerida', { valueAsNumber: true })}
            />
            {errors.cantidadRequerida && (
              <p className="text-xs text-destructive">{errors.cantidadRequerida.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* ── Clasificación ───────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold text-sm">Clasificación</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Tipo de requerimiento</Label>
            <Select
              value={tipoRequerimiento ?? 'GENERAL'}
              onValueChange={(v) =>
                setValue('tipoRequerimiento', v as Campos['tipoRequerimiento'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="PEDIDO">Pedido</SelectItem>
                <SelectItem value="PRODUCCION">Producción</SelectItem>
                <SelectItem value="MANTENIMIENTO">Mantenimiento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Fecha necesaria</Label>
            <Input type="date" {...register('fechaNecesaria')} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>ID de pedido vinculado</Label>
            <Input
              {...register('pedidoId')}
              placeholder="UUID del pedido (opcional)"
              className="font-mono text-xs"
            />
            {errors.pedidoId && (
              <p className="text-xs text-destructive">{errors.pedidoId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>ID de orden de producción vinculada</Label>
            <Input
              {...register('ordenProduccionId')}
              placeholder="UUID de la orden (opcional)"
              className="font-mono text-xs"
            />
            {errors.ordenProduccionId && (
              <p className="text-xs text-destructive">{errors.ordenProduccionId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Observaciones</Label>
          <Textarea
            {...register('observaciones')}
            placeholder="Detalle adicional del requerimiento…"
            rows={2}
          />
        </div>
      </section>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Creando requerimiento…' : 'Crear requerimiento'}
      </Button>
    </form>
  );
}
