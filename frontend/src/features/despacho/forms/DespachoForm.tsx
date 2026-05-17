import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
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
import { pedidosServicio } from '@/features/pedidos/services/pedidos.servicio';
import { useCrearDespacho } from '../hooks/useDespacho';
import type { CrearDespachoPayload } from '../types/despacho.types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  pedidoId:             z.string().regex(UUID_RE, 'Selecciona un pedido válido'),
  sedeSalidaId:         z.string().regex(UUID_RE, 'Selecciona una sede'),
  encargadoDespachoId:  z.string().optional(),
  fechaProgramada:      z.string().optional(),
  observaciones:        z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface UsuarioRef { id: string; nombre: string; email: string }

interface Props {
  onExito: (despachoId: string) => void;
}

export function DespachoForm({ onExito }: Props) {
  const mutation = useCrearDespacho();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
  });

  const pedidoSeleccionado     = watch('pedidoId');
  const sedeSeleccionada       = watch('sedeSalidaId');
  const encargadoSeleccionado  = watch('encargadoDespachoId');

  const { data: pedidos, isLoading: cargandoPedidos } = useQuery({
    queryKey: ['pedidos-ref-despacho'],
    queryFn: () => pedidosServicio.listar({ limite: 200 }),
    staleTime: 60_000,
  });

  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes-ref'],
    queryFn: () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  const { data: usuarios, isLoading: cargandoUsuarios } = useQuery({
    queryKey: ['usuarios-referencia'],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<UsuarioRef[]>>('/seguridad/usuarios');
      if (!data.exito || !data.datos) throw new Error(data.mensaje);
      return data.datos;
    },
    staleTime: 5 * 60_000,
  });

  // Limpiar encargado si cambia la sede
  useEffect(() => {
    setValue('encargadoDespachoId', undefined);
  }, [sedeSeleccionada, setValue]);

  function enviar(campos: Campos) {
    const payload: CrearDespachoPayload = {
      pedidoId:     campos.pedidoId,
      sedeSalidaId: campos.sedeSalidaId,
    };
    if (campos.encargadoDespachoId) payload.encargadoDespachoId = campos.encargadoDespachoId;
    if (campos.fechaProgramada)     payload.fechaProgramada     = campos.fechaProgramada;
    if (campos.observaciones)       payload.observaciones       = campos.observaciones;

    mutation.mutate(payload, {
      onSuccess: (d) => onExito(d.id),
    });
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      {/* Pedido */}
      <div className="space-y-1">
        <Label>Pedido *</Label>
        {cargandoPedidos ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={pedidoSeleccionado ?? ''}
            onValueChange={(v) => setValue('pedidoId', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un pedido…" />
            </SelectTrigger>
            <SelectContent>
              {pedidos?.datos.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.consecutivo} — {p.cliente.razonSocial}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.pedidoId && <p className="text-xs text-destructive">{errors.pedidoId.message}</p>}
      </div>

      {/* Sede de salida */}
      <div className="space-y-1">
        <Label>Sede de salida *</Label>
        {cargandoSedes ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={sedeSeleccionada ?? ''}
            onValueChange={(v) => setValue('sedeSalidaId', v, { shouldValidate: true })}
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
        {errors.sedeSalidaId && <p className="text-xs text-destructive">{errors.sedeSalidaId.message}</p>}
      </div>

      {/* Encargado */}
      <div className="space-y-1">
        <Label>Encargado de despacho</Label>
        {cargandoUsuarios ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={encargadoSeleccionado ?? ''}
            onValueChange={(v) => setValue('encargadoDespachoId', v || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sin asignar" />
            </SelectTrigger>
            <SelectContent>
              {usuarios?.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.nombre} ({u.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Fecha programada */}
      <div className="space-y-1">
        <Label>Fecha programada</Label>
        <Input type="date" {...register('fechaProgramada')} />
      </div>

      {/* Observaciones */}
      <div className="space-y-1">
        <Label>Observaciones</Label>
        <Textarea {...register('observaciones')} placeholder="Observaciones generales…" rows={3} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al crear el despacho.'}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creando…' : 'Crear despacho'}
        </Button>
      </div>
    </form>
  );
}
