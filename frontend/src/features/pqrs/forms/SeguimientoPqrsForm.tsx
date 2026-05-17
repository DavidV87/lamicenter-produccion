import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useCrearSeguimiento } from '../hooks/usePqrs';
import type { TipoSeguimientoPqrs } from '../types/pqrs.types';

const TIPOS: { valor: TipoSeguimientoPqrs; etiqueta: string }[] = [
  { valor: 'CREACION',     etiqueta: 'Creación' },
  { valor: 'ASIGNACION',   etiqueta: 'Asignación' },
  { valor: 'ACTUALIZACION', etiqueta: 'Actualización' },
  { valor: 'SOLUCION',     etiqueta: 'Solución' },
  { valor: 'CIERRE',       etiqueta: 'Cierre' },
  { valor: 'REAPERTURA',   etiqueta: 'Reapertura' },
  { valor: 'ANULACION',    etiqueta: 'Anulación' },
];

const esquema = z.object({
  tipoSeguimiento: z.enum(
    ['CREACION', 'ASIGNACION', 'ACTUALIZACION', 'SOLUCION', 'CIERRE', 'REAPERTURA', 'ANULACION'],
    { required_error: 'Selecciona un tipo' },
  ),
  observaciones:  z.string().min(5, 'Mínimo 5 caracteres'),
  notasInternas:  z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  pqrsId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function SeguimientoPqrsForm({ pqrsId, onExito, onCancelar }: Props) {
  const mutation = useCrearSeguimiento(pqrsId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
  });

  const tipoSeleccionado = watch('tipoSeguimiento');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        tipoSeguimiento: campos.tipoSeguimiento,
        observaciones:   campos.observaciones,
        notasInternas:   campos.notasInternas || undefined,
      },
      { onSuccess: () => { reset(); onExito(); } },
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      <div className="space-y-1">
        <Label>Tipo de seguimiento *</Label>
        <Select
          value={tipoSeleccionado ?? ''}
          onValueChange={(v) => setValue('tipoSeguimiento', v as TipoSeguimientoPqrs, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un tipo…" />
          </SelectTrigger>
          <SelectContent>
            {TIPOS.map((t) => (
              <SelectItem key={t.valor} value={t.valor}>{t.etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.tipoSeguimiento && (
          <p className="text-xs text-destructive">{errors.tipoSeguimiento.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Descripción / observaciones *</Label>
        <Textarea
          {...register('observaciones')}
          placeholder="Describe la acción o actualización…"
          rows={3}
        />
        {errors.observaciones && (
          <p className="text-xs text-destructive">{errors.observaciones.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Notas internas</Label>
        <Input {...register('notasInternas')} placeholder="Notas internas opcionales…" />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al registrar seguimiento.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Registrar seguimiento'}
        </Button>
      </div>
    </form>
  );
}
