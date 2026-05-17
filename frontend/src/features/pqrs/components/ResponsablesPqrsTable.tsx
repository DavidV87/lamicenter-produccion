import { Skeleton } from '@/shared/components/ui/skeleton';
import type { ResponsablePqrs } from '../types/pqrs.types';

const ETIQUETA_ROL: Record<string, string> = {
  CREADOR:     'Creador',
  EJECUTOR:    'Ejecutor',
  AUTORIZADOR: 'Autorizador',
  SUPERVISOR:  'Supervisor',
};

interface Props {
  responsables: ResponsablePqrs[] | undefined;
  cargando: boolean;
}

export function ResponsablesPqrsTable({ responsables, cargando }: Props) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!responsables?.length) {
    return (
      <p className="py-4 text-sm text-muted-foreground">Sin responsables asignados.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Usuario</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Rol</th>
            <th className="px-4 py-2 text-center font-medium text-muted-foreground">Activo</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Asignado por</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Desde</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Hasta</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Observaciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {responsables.map((r) => (
            <tr key={r.id} className="hover:bg-muted/30">
              <td className="px-4 py-2 font-medium">{r.usuario.nombre}</td>
              <td className="px-4 py-2">
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                  {ETIQUETA_ROL[r.rolResponsable] ?? r.rolResponsable}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                {r.activo
                  ? <span className="text-xs font-medium text-green-700">Sí</span>
                  : <span className="text-xs text-muted-foreground">No</span>}
              </td>
              <td className="px-4 py-2">{r.asignadoPor?.nombre ?? '—'}</td>
              <td className="px-4 py-2 text-xs">
                {new Date(r.fechaAsignacion).toLocaleDateString('es-CO')}
              </td>
              <td className="px-4 py-2 text-xs">
                {r.fechaFinAsignacion
                  ? new Date(r.fechaFinAsignacion).toLocaleDateString('es-CO')
                  : '—'}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{r.observaciones ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
