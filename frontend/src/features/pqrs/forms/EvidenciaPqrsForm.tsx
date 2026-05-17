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
import { useCrearEvidenciaPqrs } from '../hooks/usePqrs';
import type { TipoEvidenciaPqrs } from '../types/pqrs.types';

const TIPOS: { valor: TipoEvidenciaPqrs; etiqueta: string }[] = [
  { valor: 'FOTO',        etiqueta: 'Foto' },
  { valor: 'DOCUMENTO',   etiqueta: 'Documento' },
  { valor: 'OBSERVACION', etiqueta: 'Observación' },
];

const esquema = z
  .object({
    tipoEvidencia: z.enum(['FOTO', 'DOCUMENTO', 'OBSERVACION'], {
      required_error: 'Selecciona un tipo',
    }),
    nombreArchivo: z.string().optional(),
    rutaArchivo:   z.string().optional(),
    observaciones: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.tipoEvidencia !== 'OBSERVACION' && !d.rutaArchivo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rutaArchivo'],
        message: 'Ruta de archivo requerida para FOTO y DOCUMENTO',
      });
    }
  });

type Campos = z.infer<typeof esquema>;

interface Props {
  pqrsId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function EvidenciaPqrsForm({ pqrsId, onExito, onCancelar }: Props) {
  const mutation = useCrearEvidenciaPqrs(pqrsId);

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
          onValueChange={(v) => setValue('tipoEvidencia', v as TipoEvidenciaPqrs, { shouldValidate: true })}
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
        <Input {...register('nombreArchivo')} placeholder="foto-evidencia.jpg" />
      </div>

      <div className="space-y-1">
        <Label>
          Ruta / URL del archivo
          {tipoSeleccionado && tipoSeleccionado !== 'OBSERVACION' && (
            <span className="ml-1 text-destructive">*</span>
          )}
        </Label>
        <Input {...register('rutaArchivo')} placeholder="/evidencias/..." />
        {errors.rutaArchivo && (
          <p className="text-xs text-destructive">{errors.rutaArchivo.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Descripción / observaciones</Label>
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
