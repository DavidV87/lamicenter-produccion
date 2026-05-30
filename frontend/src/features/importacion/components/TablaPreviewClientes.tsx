import { Badge } from '@/shared/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import type { FilaPreviewCliente, EstadoFila } from '../types/importacion.types';

interface TablaPreviewClientesProps {
  filas: FilaPreviewCliente[];
}

const ETIQUETA_ESTADO: Record<EstadoFila, string> = {
  valido:            'Se creará',
  duplicado_archivo: 'Dup. archivo',
  duplicado_bd:      'Ya existe',
  error:             'Error',
};

const VARIANT_ESTADO: Record<EstadoFila, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  valido:            'default',
  duplicado_archivo: 'secondary',
  duplicado_bd:      'outline',
  error:             'destructive',
};

const FONDO_FILA: Record<EstadoFila, string> = {
  valido:            '',
  duplicado_archivo: 'bg-amber-50/60',
  duplicado_bd:      'bg-amber-50/40',
  error:             'bg-destructive/5',
};

export function TablaPreviewClientes({ filas }: TablaPreviewClientesProps) {
  if (filas.length === 0) return null;

  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Razón social</TableHead>
              <TableHead>Identificación</TableHead>
              <TableHead>Tipo ID</TableHead>
              <TableHead>Ciudad</TableHead>
              <TableHead>Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filas.map((fila) => {
              const datos = fila.datos as Record<string, unknown>;
              return (
                <TableRow key={fila.indice} className={FONDO_FILA[fila.estado]}>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {fila.indice + 2}
                  </TableCell>
                  <TableCell>
                    <Badge variant={VARIANT_ESTADO[fila.estado]}>
                      {ETIQUETA_ESTADO[fila.estado]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate">
                    {String(datos.razonSocial ?? '')}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {String(datos.identificacion ?? '')}
                  </TableCell>
                  <TableCell className="text-xs">
                    {String(datos.tipoIdentificacion ?? '')}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {String(datos.ciudad ?? '—')}
                  </TableCell>
                  <TableCell className="max-w-[240px]">
                    {fila.errores.length > 0 && (
                      <ul className="space-y-0.5">
                        {fila.errores.map((e, i) => (
                          <li key={i} className="text-xs text-destructive">{e}</li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
