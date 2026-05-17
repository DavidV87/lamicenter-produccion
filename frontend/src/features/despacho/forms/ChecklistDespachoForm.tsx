import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Switch } from '@/shared/components/ui/switch';
import { useTiposValidacionDespacho, useCrearChecklistDespacho } from '../hooks/useDespacho';

const esquema = z.object({
  observaciones: z.string().optional(),
  items: z.array(z.object({
    tipoValidacionDespachoId: z.string(),
    nombre:                   z.string(),
    cumple:                   z.boolean(),
    observaciones:            z.string().optional(),
  })).min(1, 'Se necesita al menos un ítem'),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  despachoId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function ChecklistDespachoForm({ despachoId, onExito, onCancelar }: Props) {
  const { data: tipos, isLoading } = useTiposValidacionDespacho();
  const mutation = useCrearChecklistDespacho(despachoId);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { observaciones: '', items: [] },
  });

  const { fields, replace } = useFieldArray({ control, name: 'items' });

  // Poblar ítems cuando cargan los tipos de validación
  useEffect(() => {
    if (tipos?.length) {
      replace(tipos.map((t) => ({
        tipoValidacionDespachoId: t.id,
        nombre:                   t.nombre,
        cumple:                   false,
        observaciones:            '',
      })));
    }
  }, [tipos, replace]);

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        observaciones: campos.observaciones || undefined,
        items: campos.items.map((it) => ({
          tipoValidacionDespachoId: it.tipoValidacionDespachoId,
          cumple:                   it.cumple,
          observaciones:            it.observaciones || undefined,
        })),
      },
      { onSuccess: () => { onExito(); } },
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      {/* Ítems del checklist */}
      <div className="space-y-3">
        {fields.map((field, idx) => {
          const cumple = watch(`items.${idx}.cumple`);
          return (
            <div key={field.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{field.nombre}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{cumple ? 'Cumple' : 'No cumple'}</span>
                  <Switch
                    checked={cumple}
                    onCheckedChange={(v) => setValue(`items.${idx}.cumple`, v)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Observaciones</Label>
                <Textarea
                  {...register(`items.${idx}.observaciones`)}
                  placeholder="Observaciones de este ítem…"
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {errors.items && (
        <p className="text-xs text-destructive">{errors.items.message}</p>
      )}

      {/* Observaciones generales */}
      <div className="space-y-1">
        <Label>Observaciones generales</Label>
        <Textarea
          {...register('observaciones')}
          placeholder="Observaciones del checklist…"
          rows={3}
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al registrar el checklist.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Registrar checklist'}
        </Button>
      </div>
    </form>
  );
}
