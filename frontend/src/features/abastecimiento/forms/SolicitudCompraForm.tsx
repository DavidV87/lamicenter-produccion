import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import type { CrearSolicitudCompraPayload } from '../types/abastecimiento.types';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquemaItem = z.object({
  itemId:                  z.string().min(1, 'Selecciona un ítem'),
  cantidadSolicitada:      z.number({ invalid_type_error: 'Requerido' }).positive('Debe ser mayor a 0'),
  requerimientoMaterialId: z.string().regex(UUID_REGEX, 'UUID inválido').optional().or(z.literal('')),
  observaciones:           z.string().optional(),
});

const esquema = z.object({
  sedeId:       z.string().min(1, 'Selecciona una sede'),
  proveedorId:  z.string().optional(),
  observaciones: z.string().optional(),
  items: z.array(esquemaItem).min(1, 'Agrega al menos un ítem'),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  onSubmit: (payload: CrearSolicitudCompraPayload) => void;
  cargando?: boolean;
}

const ITEM_VACIO = {
  itemId: '', cantidadSolicitada: 1, requerimientoMaterialId: '', observaciones: '',
};

export function SolicitudCompraForm({ onSubmit, cargando }: Props) {
  const { register, control, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      sedeId: '', proveedorId: '', observaciones: '', items: [{ ...ITEM_VACIO }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const sedeId      = watch('sedeId');
  const proveedorId = watch('proveedorId');

  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  const { data: proveedores, isLoading: cargandoProveedores } = useQuery({
    queryKey: ['proveedores-referencia'],
    queryFn: () => catalogoServicio.listarProveedores({ limite: 200, activo: true }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  const { data: items, isLoading: cargandoItems } = useQuery({
    queryKey: ['items-referencia'],
    queryFn: () => catalogoServicio.listarItems({ limite: 200, activo: true }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  function enviar(campos: Campos) {
    onSubmit({
      sedeId:       campos.sedeId,
      proveedorId:  campos.proveedorId || undefined,
      observaciones: campos.observaciones || undefined,
      items: campos.items.map((it) => ({
        itemId:                  it.itemId,
        cantidadSolicitada:      it.cantidadSolicitada,
        requerimientoMaterialId: it.requerimientoMaterialId || undefined,
        observaciones:           it.observaciones || undefined,
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="space-y-6">

      {/* ── Datos generales ──────────────────────────────────────────────── */}
      <section className="rounded-lg border p-4 space-y-4">
        <h3 className="font-semibold text-sm">Datos generales</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label>Sede de destino *</Label>
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
            <Label>Proveedor</Label>
            {cargandoProveedores ? <Skeleton className="h-9 w-full" /> : (
              <Select
                value={proveedorId ?? ''}
                onValueChange={(v) => setValue('proveedorId', v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin proveedor…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin proveedor</SelectItem>
                  {proveedores?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.razonSocial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Observaciones generales</Label>
          <Textarea
            {...register('observaciones')}
            placeholder="Instrucciones o notas de la solicitud…"
            rows={2}
          />
        </div>
      </section>

      {/* ── Ítems ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">Ítems a solicitar</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ ...ITEM_VACIO })}
          >
            <Plus className="mr-1 h-3 w-3" /> Agregar ítem
          </Button>
        </div>

        {errors.items && !Array.isArray(errors.items) && (
          <p className="text-sm text-destructive">{errors.items.message}</p>
        )}

        {fields.map((field, idx) => (
          <div key={field.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Ítem #{idx + 1}</span>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Ítem *</Label>
                {cargandoItems ? <Skeleton className="h-9 w-full" /> : (
                  <Select
                    value={watch(`items.${idx}.itemId`)}
                    onValueChange={(v) =>
                      setValue(`items.${idx}.itemId`, v, { shouldValidate: true })
                    }
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
                {errors.items?.[idx]?.itemId && (
                  <p className="text-xs text-destructive">{errors.items[idx]?.itemId?.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Cantidad solicitada *</Label>
                <Input
                  type="number"
                  min={1}
                  step="any"
                  {...register(`items.${idx}.cantidadSolicitada`, { valueAsNumber: true })}
                />
                {errors.items?.[idx]?.cantidadSolicitada && (
                  <p className="text-xs text-destructive">
                    {errors.items[idx]?.cantidadSolicitada?.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>ID de requerimiento vinculado</Label>
              <Input
                {...register(`items.${idx}.requerimientoMaterialId`)}
                placeholder="UUID del requerimiento (opcional)"
                className="font-mono text-xs"
              />
              {errors.items?.[idx]?.requerimientoMaterialId && (
                <p className="text-xs text-destructive">
                  {errors.items[idx]?.requerimientoMaterialId?.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Observaciones del ítem</Label>
              <Input
                {...register(`items.${idx}.observaciones`)}
                placeholder="Especificaciones o notas…"
              />
            </div>
          </div>
        ))}
      </section>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Creando solicitud…' : 'Crear solicitud de compra'}
      </Button>
    </form>
  );
}
