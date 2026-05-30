import { CheckCircle2, AlertCircle, XCircle, Info } from 'lucide-react';

interface ResumenImportacionProps {
  total: number;
  validos: number;
  duplicadosArchivo: number;
  duplicadosBd: number;
  errores: number;
}

export function ResumenImportacion({
  total,
  validos,
  duplicadosArchivo,
  duplicadosBd,
  errores,
}: ResumenImportacionProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <TarjetaResumen
        icono={<Info className="h-4 w-4 text-muted-foreground" />}
        valor={total}
        etiqueta="Total filas"
        fondo="bg-muted/40"
      />
      <TarjetaResumen
        icono={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
        valor={validos}
        etiqueta="Se crearán"
        fondo="bg-emerald-50 border border-emerald-200"
        colorValor="text-emerald-700"
      />
      <TarjetaResumen
        icono={<AlertCircle className="h-4 w-4 text-amber-500" />}
        valor={duplicadosArchivo + duplicadosBd}
        etiqueta="Duplicadas"
        fondo="bg-amber-50 border border-amber-200"
        colorValor="text-amber-700"
        tooltip={`${duplicadosArchivo} en archivo, ${duplicadosBd} ya en sistema`}
      />
      <TarjetaResumen
        icono={<XCircle className="h-4 w-4 text-destructive" />}
        valor={errores}
        etiqueta="Con errores"
        fondo="bg-destructive/5 border border-destructive/20"
        colorValor="text-destructive"
      />
    </div>
  );
}

interface TarjetaResumenProps {
  icono: React.ReactNode;
  valor: number;
  etiqueta: string;
  fondo?: string;
  colorValor?: string;
  tooltip?: string;
}

function TarjetaResumen({ icono, valor, etiqueta, fondo = 'bg-white', colorValor = 'text-foreground', tooltip }: TarjetaResumenProps) {
  return (
    <div className={`rounded-lg p-3 ${fondo}`} title={tooltip}>
      <div className="flex items-center gap-2">
        {icono}
        <span className="text-xs text-muted-foreground">{etiqueta}</span>
      </div>
      <p className={`mt-1 text-2xl font-bold ${colorValor}`}>{valor}</p>
    </div>
  );
}
