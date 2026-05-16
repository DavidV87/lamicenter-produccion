import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import type { Maquina, CrearMaquinaPayload } from '../../types/catalogo.types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  sedeId:      z.string().regex(UUID_RE, 'Debe ser un UUID válido'),
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
  const { register, formState: { errors }, handleSubmit } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      sedeId:      inicial?.sede?.id ?? '',
      nombre:      inicial?.nombre   ?? '',
      codigo:      inicial?.codigo   ?? '',
      descripcion: '',
    },
  });

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

      <div className="flex gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          El endpoint <code>/catalogo/sedes</code> no está disponible.
          Ingresa el UUID de la sede manualmente.
          {inicial?.sede && (
            <> Sede actual: <strong>{inicial.sede.nombre}</strong> ({inicial.sede.id})</>
          )}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2 space-y-1">
          <Label>ID de sede (UUID) *</Label>
          <Input {...register('sedeId')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="font-mono text-xs" />
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

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar máquina' : 'Crear máquina'}
      </Button>
    </form>
  );
}
