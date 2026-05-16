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
import { useClientes, useCrearCliente, useActualizarCliente } from '../hooks/useClientes';
import { ClienteForm } from '../components/forms/ClienteForm';
import { PaginadorCatalogo } from '../components/PaginadorCatalogo';
import type { Cliente, CrearClientePayload } from '../types/catalogo.types';

const LIMITE = 10;

export function ClientesPage() {
  const [pagina, setPagina]         = useState(1);
  const [busqueda, setBusqueda]     = useState('');
  const [soloActivos, setSoloActivos] = useState<boolean | undefined>(undefined);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando]     = useState<Cliente | null>(null);

  const { data, isLoading, isError } = useClientes({ pagina, limite: LIMITE, busqueda: busqueda || undefined, activo: soloActivos });
  const crearMutation    = useCrearCliente();
  const actualizarMutation = useActualizarCliente();

  function abrirCrear() { setEditando(null); setModalAbierto(true); }
  function abrirEditar(c: Cliente) { setEditando(c); setModalAbierto(true); }

  function handleSubmit(payload: CrearClientePayload) {
    if (editando) {
      actualizarMutation.mutate(
        { id: editando.id, payload },
        { onSuccess: () => setModalAbierto(false) },
      );
    } else {
      crearMutation.mutate(payload, { onSuccess: () => setModalAbierto(false) });
    }
  }

  function toggleActivo(c: Cliente) {
    actualizarMutation.mutate({ id: c.id, payload: { activo: !c.activo } });
  }

  const mutCargando = crearMutation.isPending || actualizarMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-muted-foreground">Empresas y personas que realizan pedidos</p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo cliente
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o NIT…"
            className="pl-8"
            value={busqueda}
            onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
          />
        </div>
        <Button
          variant={soloActivos === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSoloActivos(soloActivos === true ? undefined : true)}
        >
          Activos
        </Button>
        <Button
          variant={soloActivos === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSoloActivos(soloActivos === false ? undefined : false)}
        >
          Inactivos
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-lg border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razón social</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Correo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-24 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Cargando…
                </TableCell>
              </TableRow>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-destructive">
                  Error al cargar clientes.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && data?.datos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
            {data?.datos.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-medium">{c.razonSocial}</div>
                  {c.nombreComercial && <div className="text-xs text-muted-foreground">{c.nombreComercial}</div>}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{c.tipoIdentificacion}: {c.identificacion}</span>
                </TableCell>
                <TableCell>{c.ciudad ?? '—'}</TableCell>
                <TableCell className="text-xs">{c.correo ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={c.activo ? 'default' : 'secondary'}>
                    {c.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => abrirEditar(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActivo(c)}>
                      {c.activo
                        ? <ToggleRight className="h-4 w-4 text-marca-primario" />
                        : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {data && (
          <div className="border-t px-4 py-2">
            <PaginadorCatalogo
              pagina={data.pagina}
              totalPaginas={data.totalPaginas}
              total={data.total}
              limite={data.limite}
              onCambiar={setPagina}
            />
          </div>
        )}
      </div>

      {/* Modal */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          </DialogHeader>
          <ClienteForm
            inicial={editando ?? undefined}
            onSubmit={handleSubmit}
            cargando={mutCargando}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
