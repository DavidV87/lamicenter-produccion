import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useValidarPedido } from '../hooks/usePedidos';
import type { EstadoValidacion } from '../types/pedidos.types';

const esquema = z.object({
  estadoValidacion: z.enum(['APROBADA', 'RECHAZADA', 'REQUIERE_AJUSTE'], {
    errorMap: () => ({ message: 'Selecciona un resultado' }),
  }),
  observaciones: z.string().optional(),
  detalles: z.array(z.object({
    concepto:       z.string().min(1, 'Requerido'),
    estadoDetalle:  z.string().min(1, 'Requerido'),
    observaciones:  z.string().optional(),
  })).optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  pedidoId: string;
  abierto: boolean;
  onCerrar: () => void;
}

const OPCIONES_VALIDACION: { valor: EstadoValidacion; etiqueta: string }[] = [
  { valor: 'APROBADA',         etiqueta: 'Aprobada' },
  { valor: 'RECHAZADA',        etiqueta: 'Rechazada' },
  { valor: 'REQUIERE_AJUSTE',  etiqueta: 'Requiere ajuste' },
];

export function ValidarPedidoDialog({ pedidoId, abierto, onCerrar }: Props) {
  const mutation = useValidarPedido(pedidoId);

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors } } =
    useForm<Campos>({
      resolver: zodResolver(esquema),
      defaultValues: { estadoValidacion: undefined, observaciones: '', detalles: [] },
    });

  const { fields, append, remove } = useFieldArray({ control, name: 'detalles' });

  const estadoSeleccionado = watch('estadoValidacion');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        estadoValidacion: campos.estadoValidacion,
        observaciones:    campos.observaciones || undefined,
        detalles:         campos.detalles?.length ? campos.detalles.map((d) => ({
          concepto:      d.concepto,
          estadoDetalle: d.estadoDetalle,
          observaciones: d.observaciones || undefined,
        })) : undefined,
      },
      {
        onSuccess: () => {
          reset();
          onCerrar();
        },
      },
    );
  }

  function handleCerrar() {
    reset();
    onCerrar();
  }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Validar pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
          <div className="space-y-1">
            <Label>Resultado de validación *</Label>
            <Select
              value={estadoSeleccionado}
              onValueChange={(v) =>
                setValue('estadoValidacion', v as EstadoValidacion, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona resultado…" />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_VALIDACION.map((o) => (
                  <SelectItem key={o.valor} value={o.valor}>{o.etiqueta}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.estadoValidacion && (
              <p className="text-xs text-destructive">{errors.estadoValidacion.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Observaciones generales</Label>
            <Textarea {...register('observaciones')} placeholder="Observaciones de la validación…" rows={3} />
          </div>

          {/* Detalles de validación */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Detalles de validación</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ concepto: '', estadoDetalle: '', observaciones: '' })}
              >
                <Plus className="mr-1 h-3 w-3" /> Agregar detalle
              </Button>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="rounded-md border p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Concepto *</Label>
                    <Input
                      {...register(`detalles.${idx}.concepto`)}
                      placeholder="Ej. Cantidades verificadas"
                    />
                    {errors.detalles?.[idx]?.concepto && (
                      <p className="text-xs text-destructive">
                        {errors.detalles[idx]?.concepto?.message}
                      </p>
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs">Estado *</Label>
                    <Input
                      {...register(`detalles.${idx}.estadoDetalle`)}
                      placeholder="Ej. OK, CON_OBSERVACION"
                    />
                    {errors.detalles?.[idx]?.estadoDetalle && (
                      <p className="text-xs text-destructive">
                        {errors.detalles[idx]?.estadoDetalle?.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-5 text-destructive hover:text-destructive"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Observaciones del detalle</Label>
                  <Input
                    {...register(`detalles.${idx}.observaciones`)}
                    placeholder="Observación adicional (opcional)"
                  />
                </div>
              </div>
            ))}
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Error al validar pedido.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Validando…' : 'Registrar validación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
