import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import { useActualizarUbicacionPedido } from '../hooks/useDespacho';
import type { ActualizarUbicacionPayload } from '../types/despacho.types';

interface UbicacionRef { id: string; nombre: string; codigo: string }

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  sedeId:       z.string().regex(UUID_RE, 'Selecciona una sede'),
  ubicacionId:  z.string().optional(),
  observaciones: z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  pedidoId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function UbicacionPedidoForm({ pedidoId, onExito, onCancelar }: Props) {
  const mutation = useActualizarUbicacionPedido(pedidoId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
  });

  const sedeSeleccionada      = watch('sedeId');
  const ubicacionSeleccionada = watch('ubicacionId');

  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes-ref'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  const { data: ubicaciones, isLoading: cargandoUbicaciones } = useQuery({
    queryKey: ['ubicaciones-sede', sedeSeleccionada],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<{ datos: UbicacionRef[] }>>(
        `/catalogo/ubicaciones?sedeId=${sedeSeleccionada}&limite=200`,
      );
      if (!data.exito || !data.datos) return [];
      return data.datos.datos;
    },
    staleTime: 60_000,
    enabled: !!sedeSeleccionada,
  });

  // Limpiar ubicación cuando cambia la sede
  useEffect(() => {
    setValue('ubicacionId', undefined);
  }, [sedeSeleccionada, setValue]);

  function enviar(campos: Campos) {
    const payload: ActualizarUbicacionPayload = { sedeId: campos.sedeId };
    if (campos.ubicacionId)  payload.ubicacionId  = campos.ubicacionId;
    if (campos.observaciones) payload.observaciones = campos.observaciones;

    mutation.mutate(payload, {
      onSuccess: () => { reset(); onExito(); },
    });
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      {/* Sede */}
      <div className="space-y-1">
        <Label>Sede *</Label>
        {cargandoSedes ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={sedeSeleccionada ?? ''}
            onValueChange={(v) => setValue('sedeId', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una sede…" />
            </SelectTrigger>
            <SelectContent>
              {sedes?.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.sedeId && <p className="text-xs text-destructive">{errors.sedeId.message}</p>}
      </div>

      {/* Ubicación */}
      <div className="space-y-1">
        <Label>Ubicación específica</Label>
        {cargandoUbicaciones ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={ubicacionSeleccionada ?? ''}
            onValueChange={(v) => setValue('ubicacionId', v || undefined)}
            disabled={!sedeSeleccionada}
          >
            <SelectTrigger>
              <SelectValue placeholder={sedeSeleccionada ? 'Sin ubicación específica' : 'Selecciona una sede primero'} />
            </SelectTrigger>
            <SelectContent>
              {ubicaciones?.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} ({u.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Observaciones */}
      <div className="space-y-1">
        <Label>Observaciones</Label>
        <Textarea {...register('observaciones')} placeholder="Observaciones del movimiento…" rows={3} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al actualizar ubicación.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Guardando…' : 'Actualizar ubicación'}
        </Button>
      </div>
    </form>
  );
}
