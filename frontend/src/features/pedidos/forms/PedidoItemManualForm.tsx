import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import type { PedidoManualFormCampos } from './PedidoManualForm';

interface Props {
  index: number;
  onEliminar: () => void;
}

const DESTINO_OPCIONES = [
  { valor: 'PRODUCCION',       etiqueta: 'Producción' },
  { valor: 'DESPACHO_DIRECTO', etiqueta: 'Despacho directo' },
  { valor: 'MIXTO',            etiqueta: 'Mixto' },
];

export function PedidoItemManualForm({ index, onEliminar }: Props) {
  const { register, setValue, getValues, formState: { errors } } =
    useFormContext<PedidoManualFormCampos>();

  const itemId      = useWatch({ name: `items.${index}.itemId` });
  const destinoVal  = useWatch({ name: `items.${index}.destinoOperativo` });
  const esMatCliente = useWatch({ name: `items.${index}.esMaterialCliente` });

  const { data: items, isLoading: cargandoItems } = useQuery({
    queryKey: ['items-referencia'],
    queryFn: () => catalogoServicio.listarItems({ limite: 200 }).then((r) => r.datos),
    staleTime: 5 * 60_000,
  });

  // Cuando selecciona un ítem del catálogo, sugerir descripción
  useEffect(() => {
    if (!itemId) return;
    const item = items?.find((i) => i.id === itemId);
    if (!item) return;
    const descripcionActual = getValues(`items.${index}.descripcionOperativa`);
    if (!descripcionActual) {
      setValue(`items.${index}.descripcionOperativa`, item.nombre);
    }
  }, [itemId, items, index, setValue, getValues]);

  const errItem = errors.items?.[index];

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-muted-foreground">Ítem #{index + 1}</span>
        <Button type="button" variant="ghost" size="sm"
          className="text-destructive hover:text-destructive"
          onClick={onEliminar}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Ítem del catálogo (opcional) */}
      <div className="space-y-1">
        <Label className="text-xs">Ítem del catálogo (opcional)</Label>
        {cargandoItems ? (
          <Skeleton className="h-9 w-full" />
        ) : (
          <Select
            value={itemId ?? ''}
            onValueChange={(v) => setValue(`items.${index}.itemId`, v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin ítem de catálogo…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sin ítem</SelectItem>
              {items?.map((it) => (
                <SelectItem key={it.id} value={it.id}>
                  {it.nombre}
                  <span className="ml-1 text-xs text-muted-foreground">({it.codigo})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Descripción operativa */}
      <div className="space-y-1">
        <Label className="text-xs">Descripción operativa *</Label>
        <Textarea
          {...register(`items.${index}.descripcionOperativa`)}
          placeholder="Descripción del trabajo u operación…"
          rows={2}
        />
        {errItem?.descripcionOperativa && (
          <p className="text-xs text-destructive">{errItem.descripcionOperativa.message}</p>
        )}
      </div>

      {/* Cantidades */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Cant. total *</Label>
          <Input
            type="number"
            min={1}
            {...register(`items.${index}.cantidadTotal`, { valueAsNumber: true })}
            placeholder="0"
          />
          {errItem?.cantidadTotal && (
            <p className="text-xs text-destructive">{errItem.cantidadTotal.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Para producción *</Label>
          <Input
            type="number"
            min={0}
            {...register(`items.${index}.cantidadParaProduccion`, { valueAsNumber: true })}
            placeholder="0"
          />
          {errItem?.cantidadParaProduccion && (
            <p className="text-xs text-destructive">{errItem.cantidadParaProduccion.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Para despacho *</Label>
          <Input
            type="number"
            min={0}
            {...register(`items.${index}.cantidadParaDespachoEntero`, { valueAsNumber: true })}
            placeholder="0"
          />
          {errItem?.cantidadParaDespachoEntero && (
            <p className="text-xs text-destructive">{errItem.cantidadParaDespachoEntero.message}</p>
          )}
        </div>
      </div>

      {/* Destino operativo */}
      <div className="grid grid-cols-2 gap-2 items-end">
        <div className="space-y-1">
          <Label className="text-xs">Destino operativo *</Label>
          <Select
            value={destinoVal ?? ''}
            onValueChange={(v) =>
              setValue(`items.${index}.destinoOperativo`, v as 'PRODUCCION' | 'DESPACHO_DIRECTO' | 'MIXTO',
                { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona destino…" />
            </SelectTrigger>
            <SelectContent>
              {DESTINO_OPCIONES.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>{o.etiqueta}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errItem?.destinoOperativo && (
            <p className="text-xs text-destructive">{errItem.destinoOperativo.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2 pb-1">
          <Switch
            checked={esMatCliente ?? false}
            onCheckedChange={(v) => setValue(`items.${index}.esMaterialCliente`, v)}
          />
          <Label className="text-xs cursor-pointer">Material del cliente</Label>
        </div>
      </div>

      {/* Observaciones del ítem */}
      <div className="space-y-1">
        <Label className="text-xs">Observaciones del ítem</Label>
        <Input
          {...register(`items.${index}.observaciones`)}
          placeholder="Observación adicional (opcional)"
        />
      </div>
    </div>
  );
}
