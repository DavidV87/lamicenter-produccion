import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Skeleton } from '@/shared/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/shared/components/ui/select';
import { catalogoServicio } from '../../services/catalogo.servicio';
import type { Item, CrearItemPayload, UnidadMedida } from '../../types/catalogo.types';

const esquema = z.object({
  tipoItemId:            z.string().min(1, 'Selecciona un tipo de ítem'),
  codigo:                z.string().min(1, 'Requerido').max(80),
  nombre:                z.string().min(1, 'Requerido').max(200),
  unidadMedida:          z.enum(['METRO_CUADRADO','METRO_LINEAL','UNIDAD','HOJA','KILOGRAMO','LITRO','METRO_CUBICO']),
  descripcion:           z.string().optional().or(z.literal('')),
  precioVentaReferencia: z.string().optional().or(z.literal('')),
  costoReferencia:       z.string().optional().or(z.literal('')),
  controlaInventario:    z.boolean().default(true),
  requiereCorte:         z.boolean().default(false),
  permiteFraccion:       z.boolean().default(false),
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
  const { data: tiposItem, isLoading: cargandoTipos } = useQuery({
    queryKey: ['tipos-item'],
    queryFn:  () => catalogoServicio.obtenerTiposItem(),
    staleTime: 5 * 60_000,
  });

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

  const tipoItemId  = watch('tipoItemId');
  const unidad      = watch('unidadMedida');
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
      <div className="grid grid-cols-2 gap-4">

        <div className="col-span-2 space-y-1">
          <Label>Tipo de ítem *</Label>
          {cargandoTipos ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={tipoItemId}
              onValueChange={(v) => setValue('tipoItemId', v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tipo…" />
              </SelectTrigger>
              <SelectContent>
                {tiposItem?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nombre}
                    <span className="ml-1 text-xs text-muted-foreground">({t.comportamiento})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
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

      <Button type="submit" disabled={cargando || cargandoTipos} className="w-full">
        {cargando ? 'Guardando…' : inicial ? 'Actualizar ítem' : 'Crear ítem'}
      </Button>
    </form>
  );
}
