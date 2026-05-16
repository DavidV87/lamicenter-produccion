import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { catalogoServicio } from '../../services/catalogo.servicio';
import type { Maquina, CrearMaquinaPayload } from '../../types/catalogo.types';

const esquema = z.object({
  sedeId:      z.string().min(1, 'Selecciona una sede'),
  nombre:      z.string().min(1, 'Requerido').max(150),
  codigo:      z.string().min(1, 'Requerido').max(50),
  descripcion: z.string().optional().or(z.literal('')),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  inicial?: Maquina;
  onSubmit: (datos: CrearMaquinaPayload) => void;
  cargando?: boolean;
}

export function MaquinaForm({ inicial, onSubmit, cargando }: Props) {
  const { data: sedes, isLoading: cargandoSedes } = useQuery({
    queryKey: ['sedes'],
    queryFn:  () => catalogoServicio.obtenerSedes(),
    staleTime: 5 * 60_000,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      sedeId:      inicial?.sede?.id ?? '',
      nombre:      inicial?.nombre   ?? '',
      codigo:      inicial?.codigo   ?? '',
      descripcion: '',
    },
  });

  const sedeId = watch('sedeId');

  function enviar(campos: Campos) {
    const payload: CrearMaquinaPayload = {
      sedeId:      campos.sedeId,
      nombre:      campos.nombre,
      codigo:      campos.codigo,
      descripcion: campos.descripcion || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2 space-y-1">
          <Label>Sede *</Label>
          {cargandoSedes ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={sedeId}
              onValueChange={(v) => setValue('sedeId', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una sede…" />
              </SelectTrigger>
              <SelectContent>
                {sedes?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre}
                    <span className="ml-1 text-xs text-muted-foreground">({s.codigo})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.sedeId && <p className="text-xs text-destructive">{errors.sedeId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Input {...register('nombre')} placeholder="CNC Colombo Optima 3200" />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Código *</Label>
          <Input {...register('codigo')} placeholder="CNC-001" />
          {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Descripción</Label>
          <Textarea {...register('descripcion')} placeholder="Descripción adicional (opcional)" rows={2} />
        </div>

      </div>

      <Button type="submit" disabled={cargando || cargandoSedes} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar máquina' : 'Crear máquina'}
      </Button>
    </form>
  );
}
