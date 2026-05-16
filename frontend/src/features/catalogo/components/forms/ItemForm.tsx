import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import type { Item, CrearItemPayload, UnidadMedida } from '../../types/catalogo.types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esquema = z.object({
  tipoItemId:             z.string().regex(UUID_RE, 'Debe ser un UUID válido'),
  codigo:                 z.string().min(1, 'Requerido').max(80),
  nombre:                 z.string().min(1, 'Requerido').max(200),
  unidadMedida:           z.enum(['METRO_CUADRADO','METRO_LINEAL','UNIDAD','HOJA','KILOGRAMO','LITRO','METRO_CUBICO']),
  descripcion:            z.string().optional().or(z.literal('')),
  precioVentaReferencia:  z.string().optional().or(z.literal('')),
  costoReferencia:        z.string().optional().or(z.literal('')),
  controlaInventario:     z.boolean().default(true),
  requiereCorte:          z.boolean().default(false),
  permiteFraccion:        z.boolean().default(false),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  inicial?: Item;
  onSubmit: (datos: CrearItemPayload) => void;
  cargando?: boolean;
}

const ETIQUETAS_UNIDAD: Record<string, string> = {
  METRO_CUADRADO: 'Metro cuadrado (m²)',
  METRO_LINEAL:   'Metro lineal (ml)',
  UNIDAD:         'Unidad',
  HOJA:           'Hoja',
  KILOGRAMO:      'Kilogramo (kg)',
  LITRO:          'Litro (L)',
  METRO_CUBICO:   'Metro cúbico (m³)',
};

export function ItemForm({ inicial, onSubmit, cargando }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      tipoItemId:            inicial?.tipoItem?.id ?? '',
      codigo:                inicial?.codigo       ?? '',
      nombre:                inicial?.nombre       ?? '',
      unidadMedida:          inicial?.unidadMedida ?? 'UNIDAD',
      precioVentaReferencia: inicial?.precioVentaReferencia != null ? String(inicial.precioVentaReferencia) : '',
      costoReferencia:       inicial?.costoReferencia       != null ? String(inicial.costoReferencia)       : '',
      controlaInventario:    inicial?.controlaInventario ?? true,
      requiereCorte:         inicial?.requiereCorte      ?? false,
      permiteFraccion:       inicial?.permiteFraccion    ?? false,
    },
  });

  const unidad = watch('unidadMedida');
  const controlaInv = watch('controlaInventario');
  const requCorte   = watch('requiereCorte');
  const permFracc   = watch('permiteFraccion');

  function enviar(campos: Campos) {
    const payload: CrearItemPayload = {
      tipoItemId:   campos.tipoItemId,
      codigo:       campos.codigo,
      nombre:       campos.nombre,
      unidadMedida: campos.unidadMedida as UnidadMedida,
      descripcion:  campos.descripcion || undefined,
      precioVentaReferencia: campos.precioVentaReferencia
        ? parseFloat(campos.precioVentaReferencia)
        : undefined,
      costoReferencia: campos.costoReferencia
        ? parseFloat(campos.costoReferencia)
        : undefined,
      controlaInventario: campos.controlaInventario,
      requiereCorte:      campos.requiereCorte,
      permiteFraccion:    campos.permiteFraccion,
    };
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(enviar)} className="grid gap-4">

      {/* Aviso sobre tipoItemId */}
      <div className="flex gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          El endpoint <code>/catalogo/tipos-item</code> no está disponible.
          Ingresa el UUID del tipo de ítem manualmente (consúltalo en la base de datos o con el administrador).
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2 space-y-1">
          <Label>ID del tipo de ítem (UUID) *</Label>
          <Input {...register('tipoItemId')} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="font-mono text-xs" />
          {errors.tipoItemId && <p className="text-xs text-destructive">{errors.tipoItemId.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Código *</Label>
          <Input {...register('codigo')} placeholder="MDP-18-BL" />
          {errors.codigo && <p className="text-xs text-destructive">{errors.codigo.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Nombre *</Label>
          <Input {...register('nombre')} placeholder="Tablero MDP 18mm Blanco" />
          {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Unidad de medida *</Label>
          <Select value={unidad} onValueChange={(v) => setValue('unidadMedida', v as Campos['unidadMedida'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(ETIQUETAS_UNIDAD).map(([val, label]) => (
                <SelectItem key={val} value={val}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Precio venta referencia</Label>
          <Input {...register('precioVentaReferencia')} type="number" step="0.01" min="0" placeholder="0.00" />
        </div>

        <div className="space-y-1">
          <Label>Costo referencia</Label>
          <Input {...register('costoReferencia')} type="number" step="0.01" min="0" placeholder="0.00" />
        </div>

        <div className="col-span-2 space-y-1">
          <Label>Descripción</Label>
          <Textarea {...register('descripcion')} placeholder="Descripción adicional (opcional)" rows={2} />
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={controlaInv} onCheckedChange={(v) => setValue('controlaInventario', v)} />
          <Label>Controla inventario</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={requCorte} onCheckedChange={(v) => setValue('requiereCorte', v)} />
          <Label>Requiere corte</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch checked={permFracc} onCheckedChange={(v) => setValue('permiteFraccion', v)} />
          <Label>Permite fracción</Label>
        </div>

      </div>

      <Button type="submit" disabled={cargando} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar ítem' : 'Crear ítem'}
      </Button>
    </form>
  );
}
