import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import type { Cliente, CrearClientePayload } from '../../types/catalogo.types';

const esquema = z.object({
  razonSocial:        z.string().min(1, 'Requerido').max(200),
  identificacion:     z.string().min(1, 'Requerido').max(30),
  tipoIdentificacion: z.enum(['NIT', 'CC', 'CE', 'PAS', 'OTRO']),
  nombreComercial:    z.string().max(200).optional().or(z.literal('')),
  telefono:           z.string().max(30).optional().or(z.literal('')),
  correo:             z.string().email('Correo inválido').max(150).optional().or(z.literal('')),
  direccion:          z.string().max(255).optional().or(z.literal('')),
  ciudad:             z.string().max(100).optional().or(z.literal('')),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  inicial?: Cliente;
  onSubmit: (datos: CrearClientePayload) => void;
  cargando?: boolean;
}

export function ClienteForm({ inicial, onSubmit, cargando }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      razonSocial:        inicial?.razonSocial        ?? '',
      identificacion:     inicial?.identificacion      ?? '',
      tipoIdentificacion: inicial?.tipoIdentificacion  ?? 'NIT',
      nombreComercial:    inicial?.nombreComercial      ?? '',
      telefono:           inicial?.telefono             ?? '',
      correo:             inicial?.correo               ?? '',
      ciudad:             inicial?.ciudad               ?? '',
    },
  });

  const tipoId = watch('tipoIdentificacion');

  function enviar(campos: Campos) {
    const payload: CrearClientePayload = {
      razonSocial:        campos.razonSocial,
      identificacion:     campos.identificacion,
      tipoIdentificacion: campos.tipoIdentificacion,
      nombreComercial:    campos.nombreComercial   || undefined,
      telefono:           campos.telefono          || undefined,
      correo:             campos.correo            || undefined,
      direccion:          campos.direccion         || undefined,
      ciudad:             campos.ciudad            || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label>Razón social *</Label>
          <Input {...register('razonSocial')} placeholder="Carpintería Ejemplo S.A.S." />
          {errors.razonSocial && <p className="text-xs text-destructive">{errors.razonSocial.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Tipo de identificación *</Label>
          <Select value={tipoId} onValueChange={(v) => setValue('tipoIdentificacion', v as Campos['tipoIdentificacion'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NIT">NIT</SelectItem>
              <SelectItem value="CC">CC</SelectItem>
              <SelectItem value="CE">CE</SelectItem>
              <SelectItem value="PAS">Pasaporte</SelectItem>
              <SelectItem value="OTRO">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Identificación *</Label>
          <Input {...register('identificacion')} placeholder="901234567-8" />
          {errors.identificacion && <p className="text-xs text-destructive">{errors.identificacion.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Nombre comercial</Label>
          <Input {...register('nombreComercial')} placeholder="Nombre conocido (opcional)" />
        </div>

        <div className="space-y-1">
          <Label>Teléfono</Label>
          <Input {...register('telefono')} placeholder="3101234567" />
        </div>

        <div className="space-y-1">
          <Label>Correo</Label>
          <Input {...register('correo')} type="email" placeholder="contacto@empresa.co" />
          {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Ciudad</Label>
          <Input {...register('ciudad')} placeholder="Medellín" />
        </div>

        <div className="space-y-1">
          <Label>Dirección</Label>
          <Input {...register('direccion')} placeholder="Calle 10 # 50-20" />
        </div>
      </div>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar cliente' : 'Crear cliente'}
      </Button>
    </form>
  );
}
