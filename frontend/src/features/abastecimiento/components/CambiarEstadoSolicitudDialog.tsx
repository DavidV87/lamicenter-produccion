import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useCambiarEstadoSolicitud } from '../hooks/useAbastecimiento';

const OPCIONES = [
  { codigo: 'en_revision', nombre: 'En revisión' },
  { codigo: 'aprobada',    nombre: 'Aprobada' },
  { codigo: 'rechazada',   nombre: 'Rechazada' },
  { codigo: 'enviada',     nombre: 'Enviada' },
  { codigo: 'cancelada',   nombre: 'Cancelada' },
];

const esquema = z.object({
  estadoNuevoCodigo: z.string().min(1, 'Selecciona un estado'),
  observaciones:     z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  solicitudId: string;
  abierto: boolean;
  onCerrar: () => void;
}

export function CambiarEstadoSolicitudDialog({ solicitudId, abierto, onCerrar }: Props) {
  const mutation = useCambiarEstadoSolicitud(solicitudId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { estadoNuevoCodigo: '', observaciones: '' },
  });

  const estadoSeleccionado = watch('estadoNuevoCodigo');

  function enviar(campos: Campos) {
    mutation.mutate(
      { estadoNuevoCodigo: campos.estadoNuevoCodigo, observaciones: campos.observaciones || undefined },
      { onSuccess: () => { reset(); onCerrar(); } },
    );
  }

  function handleCerrar() { reset(); onCerrar(); }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar estado de la solicitud</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
          <div className="space-y-1">
            <Label>Nuevo estado *</Label>
            <Select
              value={estadoSeleccionado}
              onValueChange={(v) => setValue('estadoNuevoCodigo', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado…" />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES.map((o) => (
                  <SelectItem key={o.codigo} value={o.codigo}>{o.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.estadoNuevoCodigo && (
              <p className="text-xs text-destructive">{errors.estadoNuevoCodigo.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Observaciones</Label>
            <Textarea
              {...register('observaciones')}
              placeholder="Motivo del cambio de estado…"
              rows={3}
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Error al cambiar estado.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Cambiando…' : 'Cambiar estado'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
