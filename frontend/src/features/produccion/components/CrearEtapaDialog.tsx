import { useQuery } from '@tanstack/react-query';
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
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import { useCrearOrdenEtapa } from '../hooks/useProduccion';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  etapaProduccionId: z.string().regex(UUID_REGEX, 'Debe ser un UUID válido'),
  estadoEtapaCodigo: z.string().optional(),
  observaciones:     z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface EtapaReferencia {
  id: string;
  nombre: string;
  codigo: string;
  descripcion: string | null;
  orden: number;
}

interface Props {
  ordenId: string;
  abierto: boolean;
  onCerrar: () => void;
}

export function CrearEtapaDialog({ ordenId, abierto, onCerrar }: Props) {
  const mutation = useCrearOrdenEtapa(ordenId);

  const { data: etapas, isLoading: cargandoEtapas } = useQuery({
    queryKey: ['etapas-produccion-referencia'],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<EtapaReferencia[]>>('/catalogo/etapas-produccion');
      if (!data.exito || !data.datos) throw new Error(data.mensaje);
      return data.datos;
    },
    staleTime: 5 * 60_000,
    enabled: abierto,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { etapaProduccionId: '', estadoEtapaCodigo: '', observaciones: '' },
  });

  const etapaProduccionId = watch('etapaProduccionId');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        etapaProduccionId: campos.etapaProduccionId,
        estadoEtapaCodigo: campos.estadoEtapaCodigo || undefined,
        observaciones:     campos.observaciones || undefined,
      },
      { onSuccess: () => { reset(); onCerrar(); } },
    );
  }

  function handleCerrar() { reset(); onCerrar(); }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar etapa de producción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
          <div className="space-y-1">
            <Label>Etapa de producción *</Label>
            {cargandoEtapas ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={etapaProduccionId}
                onValueChange={(v) => setValue('etapaProduccionId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una etapa…" />
                </SelectTrigger>
                <SelectContent>
                  {etapas?.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                      <span className="ml-1 text-xs text-muted-foreground">({e.codigo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.etapaProduccionId && (
              <p className="text-xs text-destructive">{errors.etapaProduccionId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Código de estado inicial</Label>
            <Input
              {...register('estadoEtapaCodigo')}
              placeholder="pendiente, en_proceso… (opcional)"
            />
          </div>

          <div className="space-y-1">
            <Label>Observaciones</Label>
            <Textarea {...register('observaciones')} placeholder="Observaciones de la etapa…" rows={2} />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Error al crear etapa.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando…' : 'Crear etapa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
