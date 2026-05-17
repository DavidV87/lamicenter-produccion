import { UserPlus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/shared/components/ui/table';
import type { EtapaOrden } from '../types/produccion.types';

interface Props {
  etapas: EtapaOrden[];
  puedeAsignar: boolean;
  onAsignar: (etapaId: string) => void;
}

function uuidCorto(uuid: string | null): string {
  if (!uuid) return '—';
  return uuid.slice(0, 8) + '…';
}

export function OrdenEtapasTable({ etapas, puedeAsignar, onAsignar }: Props) {
  if (etapas.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Sin etapas registradas.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Etapa</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Operador</TableHead>
            <TableHead>Máquina asignada</TableHead>
            {puedeAsignar && <TableHead className="w-24 text-right">Acción</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {etapas.map((et) => (
            <TableRow key={et.id}>
              <TableCell>
                <div className="font-medium">
                  {et.nombreEtapa ?? 'Etapa'}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {uuidCorto(et.etapaProduccionId)}
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {et.estado.nombre}
                </span>
              </TableCell>
              <TableCell>
                {et.asignacionActual?.operador?.nombre ?? (
                  <span className="text-muted-foreground text-xs">Sin asignar</span>
                )}
              </TableCell>
              <TableCell>
                {et.asignacionActual?.maquina
                  ? `${et.asignacionActual.maquina.nombre} (${et.asignacionActual.maquina.codigo})`
                  : <span className="text-muted-foreground text-xs">—</span>}
              </TableCell>
              {puedeAsignar && (
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAsignar(et.id)}
                    title="Asignar operador"
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
