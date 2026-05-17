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
import { useAsignarResponsable } from '../hooks/usePqrs';
import type { RolResponsablePqrs } from '../types/pqrs.types';

const ROLES: { valor: RolResponsablePqrs; etiqueta: string }[] = [
  { valor: 'CREADOR',     etiqueta: 'Creador' },
  { valor: 'EJECUTOR',    etiqueta: 'Ejecutor' },
  { valor: 'AUTORIZADOR', etiqueta: 'Autorizador' },
  { valor: 'SUPERVISOR',  etiqueta: 'Supervisor' },
];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  usuarioId:      z.string().regex(UUID_RE, 'Selecciona un usuario'),
  rolResponsable: z.enum(['CREADOR', 'EJECUTOR', 'AUTORIZADOR', 'SUPERVISOR'], {
    required_error: 'Selecciona un rol',
  }),
  observaciones:  z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

interface UsuarioRef { id: string; nombre: string; email: string }

interface Props {
  pqrsId: string;
  onExito: () => void;
  onCancelar: () => void;
}

export function ResponsablePqrsForm({ pqrsId, onExito, onCancelar }: Props) {
  const mutation = useAsignarResponsable(pqrsId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
  });

  const usuarioSeleccionado = watch('usuarioId');
  const rolSeleccionado     = watch('rolResponsable');

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
    mutation.mutate(
      {
        usuarioId:      campos.usuarioId,
        rolResponsable: campos.rolResponsable,
        observaciones:  campos.observaciones || undefined,
      },
      { onSuccess: () => { reset(); onExito(); } },
    );
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      <div className="space-y-1">
        <Label>Usuario *</Label>
        {cargandoUsuarios ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={usuarioSeleccionado ?? ''}
            onValueChange={(v) => setValue('usuarioId', v, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un usuario…" />
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
        {errors.usuarioId && <p className="text-xs text-destructive">{errors.usuarioId.message}</p>}
      </div>

      <div className="space-y-1">
        <Label>Rol del responsable *</Label>
        <Select
          value={rolSeleccionado ?? ''}
          onValueChange={(v) => setValue('rolResponsable', v as RolResponsablePqrs, { shouldValidate: true })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona un rol…" />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => (
              <SelectItem key={r.valor} value={r.valor}>{r.etiqueta}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.rolResponsable && (
          <p className="text-xs text-destructive">{errors.rolResponsable.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label>Observaciones</Label>
        <Textarea {...register('observaciones')} placeholder="Motivo de asignación…" rows={2} />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {(mutation.error as Error)?.message ?? 'Error al asignar responsable.'}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Asignando…' : 'Asignar responsable'}
        </Button>
      </div>
    </form>
  );
}
