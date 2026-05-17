import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useCrearEventoOperativo } from '../hooks/useProduccion';
import type { TipoEvento } from '../types/produccion.types';

const TIPOS_EVENTO: { valor: TipoEvento; etiqueta: string }[] = [
  { valor: 'INICIO_ETAPA',       etiqueta: 'Inicio de etapa' },
  { valor: 'FIN_ETAPA',          etiqueta: 'Fin de etapa' },
  { valor: 'NOVEDAD',            etiqueta: 'Novedad' },
  { valor: 'REPROCESO',          etiqueta: 'Reproceso' },
  { valor: 'CAMBIO_PRIORIDAD',   etiqueta: 'Cambio de prioridad' },
  { valor: 'ASIGNACION_MAQUINA', etiqueta: 'Asignación de máquina' },
  { valor: 'AUTORIZACION',       etiqueta: 'Autorización' },
  { valor: 'PAUSA',              etiqueta: 'Pausa' },
];

const esquema = z.object({
  tipoEvento:   z.enum(
    ['INICIO_ETAPA', 'FIN_ETAPA', 'NOVEDAD', 'REPROCESO', 'CAMBIO_PRIORIDAD', 'ASIGNACION_MAQUINA', 'AUTORIZACION', 'PAUSA'],
    { errorMap: () => ({ message: 'Selecciona un tipo' }) },
  ),
  descripcion:  z.string().min(1, 'Requerido').max(500),
  fechaEvento:  z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  ordenId: string;
  abierto: boolean;
  onCerrar: () => void;
}

export function CrearEventoOperativoDialog({ ordenId, abierto, onCerrar }: Props) {
  const mutation = useCrearEventoOperativo(ordenId);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { tipoEvento: undefined, descripcion: '', fechaEvento: '' },
  });

  const tipoSeleccionado = watch('tipoEvento');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        ordenProduccionId: ordenId,
        tipoEvento:        campos.tipoEvento,
        descripcion:       campos.descripcion,
        fechaEvento:       campos.fechaEvento || undefined,
      },
      { onSuccess: () => { reset(); onCerrar(); } },
    );
  }

  function handleCerrar() { reset(); onCerrar(); }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar evento operativo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
          <div className="space-y-1">
            <Label>Tipo de evento *</Label>
            <Select
              value={tipoSeleccionado}
              onValueChange={(v) => setValue('tipoEvento', v as TipoEvento, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tipo…" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EVENTO.map((t) => (
                  <SelectItem key={t.valor} value={t.valor}>{t.etiqueta}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tipoEvento && (
              <p className="text-xs text-destructive">{errors.tipoEvento.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Descripción *</Label>
            <Textarea
              {...register('descripcion')}
              placeholder="Describe el evento…"
              rows={3}
            />
            {errors.descripcion && (
              <p className="text-xs text-destructive">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Fecha del evento</Label>
            <Input type="datetime-local" {...register('fechaEvento')} />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Error al registrar evento.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Registrando…' : 'Registrar evento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
