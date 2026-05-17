import { Skeleton } from '@/shared/components/ui/skeleton';
import type { EvidenciaPqrs } from '../types/pqrs.types';

const ETIQUETA_TIPO: Record<string, string> = {
  FOTO:        'Foto',
  DOCUMENTO:   'Documento',
  OBSERVACION: 'Observación',
};

interface Props {
  evidencias: EvidenciaPqrs[] | undefined;
  cargando: boolean;
}

export function EvidenciasPqrsTable({ evidencias, cargando }: Props) {
  if (cargando) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (!evidencias?.length) {
    return (
      <p className="py-4 text-sm text-muted-foreground">Sin evidencias registradas.</p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Tipo</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Archivo</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Descripción</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Registrado por</th>
            <th className="px-4 py-2 text-left font-medium text-muted-foreground">Fecha</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {evidencias.map((e) => (
            <tr key={e.id} className="hover:bg-muted/30">
              <td className="px-4 py-2">
                <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                  {ETIQUETA_TIPO[e.tipoEvidencia] ?? e.tipoEvidencia}
                </span>
              </td>
              <td className="px-4 py-2 font-mono text-xs">{e.nombreOriginal ?? '—'}</td>
              <td className="px-4 py-2 text-muted-foreground">{e.descripcion ?? '—'}</td>
              <td className="px-4 py-2">{e.creadoPor.nombre}</td>
              <td className="px-4 py-2 text-xs">
                {new Date(e.creadoEn).toLocaleDateString('es-CO')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
