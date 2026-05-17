import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { useCrearEvidenciaDespacho } from '../hooks/useDespacho';
import type { TipoEvidencia } from '../types/despacho.types';

const TIPOS: { valor: TipoEvidencia; etiqueta: string }[] = [
  { valor: 'FOTO',        etiqueta: 'Foto' },
  { valor: 'VIDEO',       etiqueta: 'Video' },
  { valor: 'DOCUMENTO',   etiqueta: 'Documento' },
  { valor: 'FIRMA',       etiqueta: 'Firma' },
  { valor: 'OBSERVACION', etiqueta: 'Observación' },
];

const esquema = z.object({
  tipoEvidencia: z.enum(['FOTO', 'VIDEO', 'DOCUMENTO', 'FIRMA', 'OBSERVACION'], {
    required_error: 'Selecciona un tipo',
  }),
  nombreArchivo: z.string().optional(),
  rutaArchivo:   z.string().optional(),
  observaciones: z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  despachoId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function EvidenciaDespachoForm({ despachoId, onExito, onCancelar }: Props) {
  const mutation = useCrearEvidenciaDespacho(despachoId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
  });

  const tipoSeleccionado = watch('tipoEvidencia');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        tipoEvidencia: campos.tipoEvidencia,
        nombreArchivo: campos.nombreArchivo || undefined,
        rutaArchivo:   campos.rutaArchivo   || undefined,
        observaciones: campos.observaciones || undefined,
      },
      { onSuccess: () => { reset(); onExito(); } },
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      <div className="space-y-1">
        <Label>Tipo de evidencia *</Label>
        <Select
          value={tipoSeleccionado ?? ''}
          onValueChange={(v) => setValue('tipoEvidencia', v as TipoEvidencia, { shouldValidate: true })}
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
        {errors.tipoEvidencia && (
          <p className="text-xs text-destructive">{errors.tipoEvidencia.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Nombre de archivo</Label>
        <Input {...register('nombreArchivo')} placeholder="foto-despacho.jpg" />
      </div>

      <div className="space-y-1">
        <Label>Ruta / URL del archivo</Label>
        <Input {...register('rutaArchivo')} placeholder="/evidencias/..." />
      </div>

      <div className="space-y-1">
        <Label>Observaciones</Label>
        <Textarea {...register('observaciones')} placeholder="Descripción de la evidencia…" rows={3} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al registrar evidencia.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Registrar evidencia'}
        </Button>
      </div>
    </form>
  );
}
