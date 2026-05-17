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
import { Switch } from '@/shared/components/ui/switch';
import { clienteApi } from '@/shared/api/cliente-api';
import type { RespuestaApi } from '@/shared/types';
import { catalogoServicio } from '@/features/catalogo/services/catalogo.servicio';
import { useCrearPqrs } from '../hooks/usePqrs';
import type { CrearPqrsPayload } from '../types/pqrs.types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z
  .object({
    clienteId:            z.string().regex(UUID_RE, 'Selecciona un cliente'),
    tipoNovedadId:        z.string().regex(UUID_RE, 'Selecciona un tipo de novedad'),
    descripcion:          z.string().min(10, 'Mínimo 10 caracteres'),
    pedidoId:             z.string().optional(),
    facturaId:            z.string().optional(),
    ordenProduccionId:    z.string().optional(),
    responsableSolucionId: z.string().optional(),
    generaReproceso:      z.boolean().optional(),
    novedadOperativaId:   z.string().optional(),
    costoEstimado:        z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.generaReproceso && !d.novedadOperativaId?.match(UUID_RE)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['novedadOperativaId'],
        message: 'UUID de novedad operativa requerido cuando genera reproceso',
      });
    }
    if (d.facturaId && !d.facturaId.match(UUID_RE)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['facturaId'], message: 'UUID inválido' });
    }
    if (d.costoEstimado && isNaN(parseFloat(d.costoEstimado))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['costoEstimado'], message: 'Debe ser un número' });
    }
    if (d.costoEstimado && parseFloat(d.costoEstimado) < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['costoEstimado'], message: 'Debe ser ≥ 0' });
    }
  });

type Campos = z.infer<typeof esquema>;

interface UsuarioRef { id: string; nombre: string; email: string }
interface TipoNovedadRef { id: string; nombre: string; aplicaA: string }
interface PedidoRef { id: string; consecutivo: string; cliente: { razonSocial: string } }

interface Props {
  onExito: (pqrsId: string, advertencias: string[]) => void;
}

export function PqrsForm({ onExito }: Props) {
  const mutation = useCrearPqrs();

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: { generaReproceso: false },
  });

  const clienteSeleccionado      = watch('clienteId');
  const tipoNovedadSeleccionado  = watch('tipoNovedadId');
  const pedidoSeleccionado       = watch('pedidoId');
  const responsableSeleccionado  = watch('responsableSolucionId');
  const generaReproceso          = watch('generaReproceso');

  const { data: clientes, isLoading: cargandoClientes } = useQuery({
    queryKey: ['clientes-ref-pqrs'],
    queryFn: () => catalogoServicio.listarClientes({ limite: 200, activo: true }),
    staleTime: 5 * 60_000,
  });

  const { data: tiposNovedad, isLoading: cargandoTipos } = useQuery({
    queryKey: ['tipos-novedad-ref'],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<TipoNovedadRef[]>>('/catalogo/tipos-novedad');
      if (!data.exito || !data.datos) throw new Error(data.mensaje);
      return data.datos;
    },
    staleTime: 5 * 60_000,
  });

  const { data: pedidos, isLoading: cargandoPedidos } = useQuery({
    queryKey: ['pedidos-ref-pqrs'],
    queryFn: async () => {
      const { data } = await clienteApi.get<RespuestaApi<{ datos: PedidoRef[] }>>('/pedidos?limite=100');
      if (!data.exito || !data.datos) throw new Error(data.mensaje);
      return data.datos.datos;
    },
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

  function enviar(campos: Campos) {
    const payload: CrearPqrsPayload = {
      clienteId:     campos.clienteId,
      tipoNovedadId: campos.tipoNovedadId,
      descripcion:   campos.descripcion,
    };
    if (campos.pedidoId)              payload.pedidoId             = campos.pedidoId;
    if (campos.facturaId)             payload.facturaId            = campos.facturaId;
    if (campos.ordenProduccionId)     payload.ordenProduccionId    = campos.ordenProduccionId;
    if (campos.responsableSolucionId) payload.responsableSolucionId = campos.responsableSolucionId;
    if (campos.generaReproceso)       payload.generaReproceso      = campos.generaReproceso;
    if (campos.novedadOperativaId)    payload.novedadOperativaId   = campos.novedadOperativaId;
    if (campos.costoEstimado)         payload.costoEstimado        = campos.costoEstimado;

    mutation.mutate(payload, {
      onSuccess: (r) => onExito(r.pqrs.id, r.advertencias),
    });
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      {/* Cliente */}
      <div className="space-y-1">
        <Label>Cliente *</Label>
        {cargandoClientes ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={clienteSeleccionado ?? ''}
            onValueChange={(v) => setValue('clienteId', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un cliente…" />
            </SelectTrigger>
            <SelectContent>
              {clientes?.datos.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.razonSocial}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
      </div>

      {/* Tipo de novedad */}
      <div className="space-y-1">
        <Label>Tipo de novedad *</Label>
        {cargandoTipos ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={tipoNovedadSeleccionado ?? ''}
            onValueChange={(v) => setValue('tipoNovedadId', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tipo de novedad…" />
            </SelectTrigger>
            <SelectContent>
              {tiposNovedad?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.nombre} ({t.aplicaA})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {errors.tipoNovedadId && (
          <p className="text-xs text-destructive">{errors.tipoNovedadId.message}</p>
        )}
      </div>

      {/* Descripción */}
      <div className="space-y-1">
        <Label>Descripción *</Label>
        <Textarea
          {...register('descripcion')}
          placeholder="Describe la novedad o queja con detalle…"
          rows={4}
        />
        {errors.descripcion && (
          <p className="text-xs text-destructive">{errors.descripcion.message}</p>
        )}
      </div>

      {/* Referencias opcionales — grid 2 columnas */}
      <div className="grid gap-3 sm:grid-cols-2">
        {/* Pedido — Select */}
        <div className="space-y-1">
          <Label>Pedido vinculado</Label>
          {cargandoPedidos ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={pedidoSeleccionado ?? ''}
              onValueChange={(v) => setValue('pedidoId', v || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin pedido…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin pedido</SelectItem>
                {pedidos?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.consecutivo} — {p.cliente.razonSocial}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Factura — UUID manual (no existe módulo UI) */}
        <div className="space-y-1">
          <Label>ID de factura</Label>
          <Input {...register('facturaId')} placeholder="UUID opcional…" className="font-mono text-sm" />
          {errors.facturaId && <p className="text-xs text-destructive">{errors.facturaId.message}</p>}
        </div>

        {/* Orden de producción — UUID manual (referencia cruzada opcional) */}
        <div className="space-y-1">
          <Label>ID de orden de producción</Label>
          <Input {...register('ordenProduccionId')} placeholder="UUID opcional…" className="font-mono text-sm" />
          {errors.ordenProduccionId && (
            <p className="text-xs text-destructive">{errors.ordenProduccionId.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Costo estimado (COP)</Label>
          <Input {...register('costoEstimado')} type="number" min="0" step="0.01" placeholder="0.00" />
          {errors.costoEstimado && (
            <p className="text-xs text-destructive">{errors.costoEstimado.message}</p>
          )}
        </div>
      </div>

      {/* Responsable de solución */}
      <div className="space-y-1">
        <Label>Responsable de solución</Label>
        {cargandoUsuarios ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={responsableSeleccionado ?? ''}
            onValueChange={(v) => setValue('responsableSolucionId', v || undefined)}
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

      {/* Genera reproceso */}
      <div className="space-y-2 rounded-lg border p-3">
        <div className="flex items-center gap-3">
          <Switch
            checked={generaReproceso ?? false}
            onCheckedChange={(v) => setValue('generaReproceso', v)}
          />
          <Label className="cursor-pointer font-medium">Genera reproceso</Label>
        </div>

        {generaReproceso && (
          <div className="space-y-1">
            <Label>ID de novedad operativa *</Label>
            <Input
              {...register('novedadOperativaId')}
              placeholder="UUID de novedad operativa…"
              className="font-mono text-sm"
            />
            {errors.novedadOperativaId && (
              <p className="text-xs text-destructive">{errors.novedadOperativaId.message}</p>
            )}
          </div>
        )}
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al crear la PQRS.'}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Creando…' : 'Crear PQRS'}
        </Button>
      </div>
    </form>
  );
}
