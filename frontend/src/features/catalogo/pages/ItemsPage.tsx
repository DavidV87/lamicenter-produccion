import { useState } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import { useItems, useCrearItem, useActualizarItem } from '../hooks/useItems';
import { ItemForm } from '../components/forms/ItemForm';
import { PaginadorCatalogo } from '../components/PaginadorCatalogo';
import type { Item, CrearItemPayload } from '../types/catalogo.types';

const LIMITE = 10;

const ETIQUETA_UNIDAD: Record<string, string> = {
  METRO_CUADRADO: 'm²', METRO_LINEAL: 'ml', UNIDAD: 'und',
  HOJA: 'hoja', KILOGRAMO: 'kg', LITRO: 'L', METRO_CUBICO: 'm³',
};

export function ItemsPage() {
  const [pagina, setPagina]             = useState(1);
  const [busqueda, setBusqueda]         = useState('');
  const [soloActivos, setSoloActivos]   = useState<boolean | undefined>(undefined);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState<Item | null>(null);

  const { data, isLoading, isError } = useItems({ pagina, limite: LIMITE, busqueda: busqueda || undefined, activo: soloActivos });
  const crearMutation      = useCrearItem();
  const actualizarMutation = useActualizarItem();

  function abrirCrear() { setEditando(null); setModalAbierto(true); }
  function abrirEditar(i: Item) { setEditando(i); setModalAbierto(true); }

  function handleSubmit(payload: CrearItemPayload) {
    if (editando) {
      actualizarMutation.mutate(
        { id: editando.id, payload },
        { onSuccess: () => setModalAbierto(false) },
      );
    } else {
      crearMutation.mutate(payload, { onSuccess: () => setModalAbierto(false) });
    }
  }

  function toggleActivo(i: Item) {
    actualizarMutation.mutate({ id: i.id, payload: { activo: !i.activo } });
  }

  const mutCargando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ítems</h1>
          <p className="text-sm text-muted-foreground">Productos, materiales y servicios del portafolio</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo ítem
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre…"
            className="pl-8"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
        <Button variant={soloActivos === true ? 'default' : 'outline'} size="sm"
          onClick={() => setSoloActivos(soloActivos === true ? undefined : true)}>Activos</Button>
        <Button variant={soloActivos === false ? 'default' : 'outline'} size="sm"
          onClick={() => setSoloActivos(soloActivos === false ? undefined : false)}>Inactivos</Button>
      </div>

      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Precio ref.</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Cargando…</TableCell></TableRow>}
            {isError  && <TableRow><TableCell colSpan={7} className="py-10 text-center text-destructive">Error al cargar ítems.</TableCell></TableRow>}
            {!isLoading && !isError && data?.datos.length === 0 && (
              <TableRow><TableCell colSpan={7} className="py-10 text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>
            )}
            {data?.datos.map((item) => (
              <TableRow key={item.id}>
                <TableCell><span className="font-mono text-xs">{item.codigo}</span></TableCell>
                <TableCell><span className="font-medium">{item.nombre}</span></TableCell>
                <TableCell><Badge variant="outline">{item.tipoItem.nombre}</Badge></TableCell>
                <TableCell>{ETIQUETA_UNIDAD[item.unidadMedida] ?? item.unidadMedida}</TableCell>
                <TableCell>
                  {item.precioVentaReferencia != null
                    ? `$${item.precioVentaReferencia.toLocaleString('es-CO')}`
                    : '—'}
                </TableCell>
                <TableCell><Badge variant={item.activo ? 'default' : 'secondary'}>{item.activo ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActivo(item)}>
                      {item.activo ? <ToggleRight className="h-4 w-4 text-marca-primario" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {data && (
          <div className="border-t px-4 py-2">
            <PaginadorCatalogo pagina={data.pagina} totalPaginas={data.totalPaginas} total={data.total} limite={data.limite} onCambiar={setPagina} />
          </div>
        )}
      </div>

      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar ítem' : 'Nuevo ítem'}</DialogTitle>
          </DialogHeader>
          <ItemForm inicial={editando ?? undefined} onSubmit={handleSubmit} cargando={mutCargando} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
