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
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import { useAsignarOrdenEtapa } from '../hooks/useProduccion';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  operadorId:            z.string().regex(UUID_REGEX, 'Debe ser un UUID válido'),
  maquinaId:             z.string().optional(),
  fechaInicioAsignacion: z.string().optional(),
  motivo:                z.string().optional(),
  observaciones:         z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface UsuarioReferencia {
  id: string;
  nombre: string;
  email: string;
  rol: { nombre: string };
}

interface Props {
  ordenId: string;
  etapaId: string;
  abierto: boolean;
  onCerrar: () => void;
}

export function AsignarEtapaDialog({ ordenId, etapaId, abierto, onCerrar }: Props) {
  const mutation = useAsignarOrdenEtapa(ordenId);

  const { data: maquinas, isLoading: cargandoMaquinas } = useQuery({
    queryKey: ['maquinas-referencia'],
    queryFn: () => catalogoServicio.listarMaquinas({ limite: 200 }).then((r) => r.datos),
    staleTime: 5 * 60_000,
    enabled: abierto,
  });

  const { data: usuarios, isLoading: cargandoUsuarios } = useQuery({
    queryKey: ['usuarios-referencia'],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<UsuarioReferencia[]>>('/seguridad/usuarios');
      if (!data.exito || !data.datos) throw new Error(data.mensaje);
      return data.datos;
    },
    staleTime: 5 * 60_000,
    enabled: abierto,
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { operadorId: '', maquinaId: '', fechaInicioAsignacion: '', motivo: '', observaciones: '' },
  });

  const operadorId = watch('operadorId');
  const maquinaId  = watch('maquinaId');

  function enviar(campos: Campos) {
    mutation.mutate(
      {
        etapaId,
        payload: {
          operadorId:            campos.operadorId,
          maquinaId:             campos.maquinaId || undefined,
          fechaInicioAsignacion: campos.fechaInicioAsignacion || undefined,
          motivo:                campos.motivo || undefined,
          observaciones:         campos.observaciones || undefined,
        },
      },
      { onSuccess: () => { reset(); onCerrar(); } },
    );
  }

  function handleCerrar() { reset(); onCerrar(); }

  return (
    <Dialog open={abierto} onOpenChange={handleCerrar}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar operador a etapa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
          <div className="space-y-1">
            <Label>Operador *</Label>
            {cargandoUsuarios ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={operadorId}
                onValueChange={(v) => setValue('operadorId', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un operador…" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios?.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nombre}
                      <span className="ml-1 text-xs text-muted-foreground">({u.email})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.operadorId && (
              <p className="text-xs text-destructive">{errors.operadorId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>Máquina asignada</Label>
            {cargandoMaquinas ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={maquinaId ?? ''}
                onValueChange={(v) => setValue('maquinaId', v || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin máquina…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin máquina</SelectItem>
                  {maquinas?.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nombre}
                      <span className="ml-1 text-xs text-muted-foreground">({m.codigo})</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1">
            <Label>Fecha inicio asignación</Label>
            <Input type="datetime-local" {...register('fechaInicioAsignacion')} />
          </div>

          <div className="space-y-1">
            <Label>Motivo</Label>
            <Input {...register('motivo')} placeholder="Motivo de asignación (opcional)" />
          </div>

          <div className="space-y-1">
            <Label>Observaciones</Label>
            <Textarea {...register('observaciones')} placeholder="Observaciones adicionales…" rows={2} />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as Error)?.message ?? 'Error al asignar etapa.'}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCerrar}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Asignando…' : 'Confirmar asignación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
