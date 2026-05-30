import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { DropzoneExcel } from '../components/DropzoneExcel';
import { TablaPreviewClientes } from '../components/TablaPreviewClientes';
import { ResumenImportacion } from '../components/ResumenImportacion';
import { usePrevisualizarClientes, useConfirmarImportacionClientes } from '../hooks/useImportacionClientes';
import { parsearExcelClientes } from '../utils/parsear-excel-clientes';
import type { FilaClienteEntrada, ResumenPreviewClientes, ResultadoImportacionClientes } from '../types/importacion.types';

type Paso = 1 | 2 | 3;

export function ImportacionClientesPage() {
  const navegar = useNavigate();
  const [paso, setPaso] = useState<Paso>(1);
  const [errorParseo, setErrorParseo] = useState<string | null>(null);
  const [filasParseadas, setFilasParseadas] = useState<FilaClienteEntrada[]>([]);
  const [preview, setPreview] = useState<ResumenPreviewClientes | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacionClientes | null>(null);

  const previsualizarMut = usePrevisualizarClientes();
  const confirmarMut     = useConfirmarImportacionClientes();

  // ── Paso 1: cargar y parsear Excel ──────────────────────────────────────────

  async function onArchivoCargado(archivo: File) {
    setErrorParseo(null);
    setFilasParseadas([]);
    setPreview(null);
    try {
      const filas = await parsearExcelClientes(archivo);
      if (filas.length === 0) {
        setErrorParseo('El archivo no contiene filas de datos.');
        return;
      }
      if (filas.length > 500) {
        setErrorParseo('El archivo supera el límite de 500 filas por importación.');
        return;
      }
      setFilasParseadas(filas);
    } catch (err) {
      setErrorParseo(err instanceof Error ? err.message : 'Error al leer el archivo');
    }
  }

  async function irAPrevisualizacion() {
    setPreview(null);
    previsualizarMut.mutate(filasParseadas, {
      onSuccess: (data) => {
        setPreview(data);
        setPaso(2);
      },
    });
  }

  // ── Paso 2: previsualizar y confirmar ────────────────────────────────────────

  function filasValidas(): FilaClienteEntrada[] {
    if (!preview) return [];
    return preview.filas
      .filter((f) => f.estado === 'valido')
      .map((f) => filasParseadas[f.indice]);
  }

  async function confirmarImportacion() {
    const validas = filasValidas();
    if (validas.length === 0) return;
    confirmarMut.mutate(validas, {
      onSuccess: (data) => {
        setResultado(data);
        setPaso(3);
      },
    });
  }

  // ── Paso 3: resultado ────────────────────────────────────────────────────────

  function reiniciar() {
    setPaso(1);
    setFilasParseadas([]);
    setPreview(null);
    setResultado(null);
    setErrorParseo(null);
    previsualizarMut.reset();
    confirmarMut.reset();
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navegar('/catalogo/clientes')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Importación de Clientes</h1>
          <p className="text-sm text-muted-foreground">Carga masiva desde archivo Excel</p>
        </div>
      </div>

      {/* Indicador de pasos */}
      <PasoIndicador paso={paso} />

      {/* ── Paso 1: Cargar archivo ── */}
      {paso === 1 && (
        <div className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">Paso 1 — Cargar archivo Excel</h2>
            <p className="text-sm text-muted-foreground mt-1">
              El archivo debe tener las columnas: <code className="rounded bg-muted px-1 text-xs">razon_social</code>,{' '}
              <code className="rounded bg-muted px-1 text-xs">identificacion</code>,{' '}
              <code className="rounded bg-muted px-1 text-xs">tipo_identificacion</code> (NIT / CC / CE / PAS / OTRO)
            </p>
          </div>

          <DropzoneExcel
            onArchivoCargado={onArchivoCargado}
            cargando={previsualizarMut.isPending}
          />

          {errorParseo && (
            <p className="text-sm text-destructive">{errorParseo}</p>
          )}

          {previsualizarMut.isError && (
            <p className="text-sm text-destructive">
              {previsualizarMut.error instanceof Error
                ? previsualizarMut.error.message
                : 'Error al previsualizar'}
            </p>
          )}

          {filasParseadas.length > 0 && (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {filasParseadas.length} fila{filasParseadas.length !== 1 ? 's' : ''} detectada{filasParseadas.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button
                onClick={irAPrevisualizacion}
                disabled={previsualizarMut.isPending}
              >
                {previsualizarMut.isPending ? 'Analizando…' : 'Previsualizar'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Paso 2: Previsualización ── */}
      {paso === 2 && preview && (
        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Paso 2 — Previsualización</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Revisa los resultados antes de confirmar. Solo se importarán las filas marcadas como <strong>Se creará</strong>.
              </p>
            </div>

            <ResumenImportacion
              total={preview.total}
              validos={preview.validos}
              duplicadosArchivo={preview.duplicadosArchivo}
              duplicadosBd={preview.duplicadosBd}
              errores={preview.errores}
            />
          </div>

          <TablaPreviewClientes filas={preview.filas} />

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => { setPaso(1); setPreview(null); }}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Cargar otro archivo
            </Button>

            <div className="flex items-center gap-3">
              {confirmarMut.isError && (
                <p className="text-sm text-destructive">
                  {confirmarMut.error instanceof Error
                    ? confirmarMut.error.message
                    : 'Error al confirmar'}
                </p>
              )}
              <Button
                onClick={confirmarImportacion}
                disabled={preview.validos === 0 || confirmarMut.isPending}
              >
                {confirmarMut.isPending
                  ? 'Importando…'
                  : `Confirmar importación (${preview.validos} clientes)`}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Paso 3: Resultado ── */}
      {paso === 3 && resultado && (
        <div className="rounded-lg border bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Importación completada</h2>
              <p className="text-sm text-muted-foreground">Los clientes han sido registrados en el sistema</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border bg-emerald-50 p-4 text-center">
              <p className="text-3xl font-bold text-emerald-700">{resultado.creados}</p>
              <p className="text-sm text-emerald-600 mt-1">Clientes creados</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{resultado.omitidos}</p>
              <p className="text-sm text-muted-foreground mt-1">Omitidos (ya existían)</p>
            </div>
            <div className="rounded-lg border bg-muted/40 p-4 text-center">
              <p className="text-3xl font-bold text-muted-foreground">{resultado.errores}</p>
              <p className="text-sm text-muted-foreground mt-1">Errores</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={reiniciar}>
              Importar otro archivo
            </Button>
            <Button onClick={() => navegar('/catalogo/clientes')}>
              Ver clientes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente interno: indicador de pasos ──────────────────────────────────

function PasoIndicador({ paso }: { paso: Paso }) {
  const pasos = [
    { num: 1, etiqueta: 'Cargar archivo' },
    { num: 2, etiqueta: 'Previsualizar'  },
    { num: 3, etiqueta: 'Resultado'      },
  ];

  return (
    <div className="flex items-center gap-0">
      {pasos.map((p, i) => (
        <div key={p.num} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={[
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
                paso > p.num
                  ? 'bg-marca-primario text-white'
                  : paso === p.num
                  ? 'bg-marca-primario text-white ring-2 ring-marca-primario ring-offset-2'
                  : 'bg-muted text-muted-foreground',
              ].join(' ')}
            >
              {paso > p.num ? <CheckCircle2 className="h-4 w-4" /> : p.num}
            </div>
            <span
              className={[
                'text-sm',
                paso === p.num ? 'font-semibold text-foreground' : 'text-muted-foreground',
              ].join(' ')}
            >
              {p.etiqueta}
            </span>
          </div>
          {i < pasos.length - 1 && (
            <div className={[
              'mx-3 h-px w-8',
              paso > p.num ? 'bg-marca-primario' : 'bg-muted',
            ].join(' ')} />
          )}
        </div>
      ))}
    </div>
  );
}
