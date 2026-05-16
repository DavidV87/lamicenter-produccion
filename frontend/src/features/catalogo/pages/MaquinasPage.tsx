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
import { useMaquinas, useCrearMaquina, useActualizarMaquina } from '../hooks/useMaquinas';
import { MaquinaForm } from '../components/forms/MaquinaForm';
import { PaginadorCatalogo } from '../components/PaginadorCatalogo';
import type { Maquina, CrearMaquinaPayload } from '../types/catalogo.types';

const LIMITE = 10;

export function MaquinasPage() {
  const [pagina, setPagina]             = useState(1);
  const [busqueda, setBusqueda]         = useState('');
  const [soloActivos, setSoloActivos]   = useState<boolean | undefined>(undefined);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]         = useState<Maquina | null>(null);

  const { data, isLoading, isError } = useMaquinas({ pagina, limite: LIMITE, busqueda: busqueda || undefined, activo: soloActivos });
  const crearMutation      = useCrearMaquina();
  const actualizarMutation = useActualizarMaquina();

  function abrirCrear() { setEditando(null); setModalAbierto(true); }
  function abrirEditar(m: Maquina) { setEditando(m); setModalAbierto(true); }

  function handleSubmit(payload: CrearMaquinaPayload) {
    if (editando) {
      actualizarMutation.mutate(
        { id: editando.id, payload },
        { onSuccess: () => setModalAbierto(false) },
      );
    } else {
      crearMutation.mutate(payload, { onSuccess: () => setModalAbierto(false) });
    }
  }

  function toggleActivo(m: Maquina) {
    actualizarMutation.mutate({ id: m.id, payload: { activo: !m.activo } });
  }

  const mutCargando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Máquinas</h1>
          <p className="text-sm text-muted-foreground">Equipos de producción registrados por sede</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" /> Nueva máquina
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código…"
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
              <TableHead>Sede</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Cargando…</TableCell></TableRow>}
            {isError  && <TableRow><TableCell colSpan={5} className="py-10 text-center text-destructive">Error al cargar máquinas.</TableCell></TableRow>}
            {!isLoading && !isError && data?.datos.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Sin resultados.</TableCell></TableRow>
            )}
            {data?.datos.map((m) => (
              <TableRow key={m.id}>
                <TableCell><span className="font-mono text-xs">{m.codigo}</span></TableCell>
                <TableCell><span className="font-medium">{m.nombre}</span></TableCell>
                <TableCell>{m.sede.nombre}</TableCell>
                <TableCell><Badge variant={m.activo ? 'default' : 'secondary'}>{m.activo ? 'Activa' : 'Inactiva'}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(m)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActivo(m)}>
                      {m.activo ? <ToggleRight className="h-4 w-4 text-marca-primario" /> : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
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
            <DialogTitle>{editando ? 'Editar máquina' : 'Nueva máquina'}</DialogTitle>
          </DialogHeader>
          <MaquinaForm inicial={editando ?? undefined} onSubmit={handleSubmit} cargando={mutCargando} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
