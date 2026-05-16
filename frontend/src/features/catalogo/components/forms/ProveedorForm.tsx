import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import type { Proveedor, CrearProveedorPayload } from '../../types/catalogo.types';

const esquema = z.object({
  razonSocial:        z.string().min(1, 'Requerido').max(200),
  identificacion:     z.string().min(1, 'Requerido').max(30),
  tipoIdentificacion: z.enum(['NIT', 'CC', 'CE', 'PAS', 'OTRO']),
  tipoProveedor:      z.enum(['MATERIAL', 'SERVICIO', 'TRANSPORTE', 'MIXTO']),
  nombreComercial:    z.string().max(200).optional().or(z.literal('')),
  telefono:           z.string().max(30).optional().or(z.literal('')),
  correo:             z.string().email('Correo inválido').max(150).optional().or(z.literal('')),
  direccion:          z.string().max(255).optional().or(z.literal('')),
  ciudad:             z.string().max(100).optional().or(z.literal('')),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  inicial?: Proveedor;
  onSubmit: (datos: CrearProveedorPayload) => void;
  cargando?: boolean;
}

export function ProveedorForm({ inicial, onSubmit, cargando }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      razonSocial:        inicial?.razonSocial        ?? '',
      identificacion:     inicial?.identificacion      ?? '',
      tipoIdentificacion: inicial?.tipoIdentificacion  ?? 'NIT',
      tipoProveedor:      inicial?.tipoProveedor        ?? 'MATERIAL',
      nombreComercial:    inicial?.nombreComercial      ?? '',
      telefono:           inicial?.telefono             ?? '',
      correo:             inicial?.correo               ?? '',
      ciudad:             inicial?.ciudad               ?? '',
    },
  });

  const tipoId  = watch('tipoIdentificacion');
  const tipoProv = watch('tipoProveedor');

  function enviar(campos: Campos) {
    const payload: CrearProveedorPayload = {
      razonSocial:        campos.razonSocial,
      identificacion:     campos.identificacion,
      tipoIdentificacion: campos.tipoIdentificacion,
      tipoProveedor:      campos.tipoProveedor,
      nombreComercial:    campos.nombreComercial || undefined,
      telefono:           campos.telefono        || undefined,
      correo:             campos.correo          || undefined,
      direccion:          campos.direccion       || undefined,
      ciudad:             campos.ciudad          || undefined,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2 space-y-1">
          <Label>Razón social *</Label>
          <Input {...register('razonSocial')} placeholder="Distribuidora Ejemplo S.A.S." />
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
          <Input {...register('identificacion')} placeholder="800123456-1" />
          {errors.identificacion && <p className="text-xs text-destructive">{errors.identificacion.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Tipo de proveedor *</Label>
          <Select value={tipoProv} onValueChange={(v) => setValue('tipoProveedor', v as Campos['tipoProveedor'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MATERIAL">Material</SelectItem>
              <SelectItem value="SERVICIO">Servicio</SelectItem>
              <SelectItem value="TRANSPORTE">Transporte</SelectItem>
              <SelectItem value="MIXTO">Mixto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Nombre comercial</Label>
          <Input {...register('nombreComercial')} placeholder="Nombre conocido (opcional)" />
        </div>

        <div className="space-y-1">
          <Label>Teléfono</Label>
          <Input {...register('telefono')} placeholder="6041234567" />
        </div>

        <div className="space-y-1">
          <Label>Correo</Label>
          <Input {...register('correo')} type="email" placeholder="ventas@proveedor.co" />
          {errors.correo && <p className="text-xs text-destructive">{errors.correo.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Ciudad</Label>
          <Input {...register('ciudad')} placeholder="Bogotá" />
        </div>

        <div className="space-y-1">
          <Label>Dirección</Label>
          <Input {...register('direccion')} placeholder="Carrera 30 # 45-10" />
        </div>

      </div>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar proveedor' : 'Crear proveedor'}
      </Button>
    </form>
  );
}
