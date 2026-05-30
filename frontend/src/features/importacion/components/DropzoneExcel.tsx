import { useRef, useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';

interface DropzoneExcelProps {
  onArchivoCargado: (archivo: File) => void;
  cargando?: boolean;
}

export function DropzoneExcel({ onArchivoCargado, cargando = false }: DropzoneExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [sobreZona, setSobreZona] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validarYCargar(archivo: File) {
    setError(null);
    const esExcel =
      archivo.name.endsWith('.xlsx') ||
      archivo.name.endsWith('.xls') ||
      archivo.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      archivo.type === 'application/vnd.ms-excel';

    if (!esExcel) {
      setError('Solo se aceptan archivos Excel (.xlsx o .xls)');
      return;
    }
    onArchivoCargado(archivo);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (archivo) validarYCargar(archivo);
    // Resetear para permitir seleccionar el mismo archivo nuevamente
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setSobreZona(false);
    const archivo = e.dataTransfer.files?.[0];
    if (archivo) validarYCargar(archivo);
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => !cargando && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setSobreZona(true); }}
        onDragLeave={() => setSobreZona(false)}
        onDrop={onDrop}
        className={[
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed',
          'px-6 py-12 text-center transition-colors cursor-pointer',
          cargando
            ? 'cursor-not-allowed opacity-50 border-muted'
            : sobreZona
            ? 'border-marca-primario bg-marca-primario/5'
            : 'border-muted hover:border-marca-primario hover:bg-muted/30',
        ].join(' ')}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {cargando ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-marca-primario border-t-transparent" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">
            {cargando ? 'Procesando archivo…' : 'Arrastra tu archivo aquí o haz clic para seleccionar'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Formatos aceptados: .xlsx, .xls — máximo 500 filas
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Plantilla: razon_social, identificacion, tipo_identificacion (obligatorios)</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={onInputChange}
        className="hidden"
        disabled={cargando}
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
