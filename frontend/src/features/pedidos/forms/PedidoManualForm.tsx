import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import { PedidoItemManualForm } from './PedidoItemManualForm';
import type { CrearPedidoPayload } from '../types/pedidos.types';

const esquemaItem = z.object({
  itemId:                     z.string().optional(),
  descripcionOperativa:       z.string().min(1, 'Requerido').max(500),
  cantidadTotal:              z.number({ invalid_type_error: 'Requerido' }).positive('Debe ser mayor a 0'),
  cantidadParaProduccion:     z.number({ invalid_type_error: 'Requerido' }).min(0, 'Mínimo 0'),
  cantidadParaDespachoEntero: z.number({ invalid_type_error: 'Requerido' }).min(0, 'Mínimo 0'),
  destinoOperativo:           z.enum(['PRODUCCION', 'DESPACHO_DIRECTO', 'MIXTO'], {
    errorMap: () => ({ message: 'Selecciona un destino' }),
  }),
  esMaterialCliente: z.boolean().optional(),
  observaciones:     z.string().optional(),
}).refine(
  (d) => d.cantidadParaProduccion + d.cantidadParaDespachoEntero <= d.cantidadTotal,
  {
    message: 'Producción + despacho no puede superar cantidad total',
    path: ['cantidadParaDespachoEntero'],
  },
);

const esquema = z.object({
  clienteId:          z.string().min(1, 'Selecciona un cliente'),
  sedeVentaId:        z.string().optional(),
  sedeResponsableId:  z.string().optional(),
  sedeDespachoId:     z.string().optional(),
  fechaEntregaPrometida: z.string().optional(),
  observaciones:      z.string().optional(),
  items: z.array(esquemaItem).min(1, 'Agrega al menos un ítem'),
});

export type PedidoManualFormCampos = z.infer<typeof esquema>;

interface Props {
  onSubmit: (payload: CrearPedidoPayload) => void;
  cargando?: boolean;
}

export function PedidoManualForm({ onSubmit, cargando }: Props) {
  const metodos = useForm<PedidoManualFormCampos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      clienteId: '', sedeVentaId: '', sedeResponsableId: '', sedeDespachoId: '',
      fechaEntregaPrometida: '', observaciones: '',
      items: [{
        itemId: undefined, descripcionOperativa: '',
        cantidadTotal: 1, cantidadParaProduccion: 0, cantidadParaDespachoEntero: 0,
        destinoOperativo: 'PRODUCCION', esMaterialCliente: false, observaciones: '',
      }],
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = metodos;
  const { fields, append, remove } = useFieldArray({ control: metodos.control, name: 'items' });

  const clienteId         = watch('clienteId');
  const sedeVentaId       = watch('sedeVentaId');
  const sedeResponsableId = watch('sedeResponsableId');
  const sedeDespachoId    = watch('sedeDespachoId');

  const { data: clientes, isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes-referencia'],
    queryFn: () => catalogoServicio.listarClientes({ limite: 200 }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  function enviar(campos: PedidoManualFormCampos) {
    const payload: CrearPedidoPayload = {
      clienteId:             campos.clienteId,
      sedeVentaId:           campos.sedeVentaId || undefined,
      sedeResponsableId:     campos.sedeResponsableId || undefined,
      sedeDespachoId:        campos.sedeDespachoId || undefined,
      fechaEntregaPrometida: campos.fechaEntregaPrometida || undefined,
      observaciones:         campos.observaciones || undefined,
      items: campos.items.map((it) => ({
        itemId:                     it.itemId || undefined,
        descripcionOperativa:       it.descripcionOperativa,
        cantidadTotal:              it.cantidadTotal,
        cantidadParaProduccion:     it.cantidadParaProduccion,
        cantidadParaDespachoEntero: it.cantidadParaDespachoEntero,
        destinoOperativo:           it.destinoOperativo,
        esMaterialCliente:          it.esMaterialCliente,
        observaciones:              it.observaciones || undefined,
      })),
    };
    onSubmit(payload);
  }

  function agregarItem() {
    append({
      itemId: undefined, descripcionOperativa: '',
      cantidadTotal: 1, cantidadParaProduccion: 0, cantidadParaDespachoEntero: 0,
      destinoOperativo: 'PRODUCCION', esMaterialCliente: false, observaciones: '',
    });
  }

  return (
    <FormProvider {...metodos}>
      <form onSubmit={handleSubmit(enviar)} className="space-y-6">

        {/* ── Sección cliente ─────────────────────────────────────────── */}
        <section className="rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold text-sm">Cliente</h3>

          <div className="space-y-1">
            <Label>Cliente *</Label>
            {cargandoClientes ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={clienteId}
                onValueChange={(v) => setValue('clienteId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un cliente…" />
                </SelectTrigger>
                <SelectContent>
                  {clientes?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.razonSocial}
                      <span className="ml-1 text-xs text-muted-foreground">({c.identificacion})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.clienteId && (
              <p className="text-xs text-destructive">{errors.clienteId.message}</p>
            )}
          </div>
        </section>

        {/* ── Sección datos generales ──────────────────────────────────── */}
        <section className="rounded-lg border p-4 space-y-3">
          <h3 className="font-semibold text-sm">Datos generales</h3>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Sede venta */}
            <div className="space-y-1">
              <Label>Sede de venta</Label>
              {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
                <Select
                  value={sedeVentaId ?? ''}
                  onValueChange={(v) => setValue('sedeVentaId', v || undefined)}
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

            {/* Sede responsable */}
            <div className="space-y-1">
              <Label>Sede responsable</Label>
              {cargandoSedes ? <Skeleton className="h-9 w-full" /> : (
                <Select
                  value={sedeResponsableId ?? ''}
                  onValueChange={(v) => setValue('sedeResponsableId', v || undefined)}
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

            {/* Sede despacho */}
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

          <div className="space-y-1">
            <Label>Fecha de entrega prometida</Label>
            <Input type="date" {...register('fechaEntregaPrometida')} />
          </div>

          <div className="space-y-1">
            <Label>Observaciones del pedido</Label>
            <Textarea
              {...register('observaciones')}
              placeholder="Notas generales del pedido…"
              rows={2}
            />
          </div>
        </section>

        {/* ── Sección ítems ────────────────────────────────────────────── */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Ítems del pedido</h3>
            <Button type="button" variant="outline" size="sm" onClick={agregarItem}>
              <Plus className="mr-1 h-3 w-3" /> Agregar ítem
            </Button>
          </div>

          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}

          {fields.map((field, idx) => (
            <PedidoItemManualForm
              key={field.id}
              index={idx}
              onEliminar={() => remove(idx)}
            />
          ))}
        </section>

        <Button type="submit" disabled={cargando} className="w-full">
          {cargando ? 'Guardando pedido…' : 'Crear pedido'}
        </Button>
      </form>
    </FormProvider>
  );
}
