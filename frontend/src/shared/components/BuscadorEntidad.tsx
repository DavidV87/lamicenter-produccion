import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';

interface BuscadorEntidadProps {
  placeholder?: string;
  onBuscar: (termino: string) => void;
  debounceMs?: number;
  disabled?: boolean;
}

export function BuscadorEntidad({
  placeholder = 'Buscar…',
  onBuscar,
  debounceMs = 400,
  disabled = false,
}: BuscadorEntidadProps) {
  const [valor, setValor] = useState('');
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onBuscar);

  // Mantener el ref actualizado sin re-disparar el efecto de debounce
  useEffect(() => {
    callbackRef.current = onBuscar;
  });

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => callbackRef.current(valor), debounceMs);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [valor, debounceMs]);

  function limpiar() {
    setValor('');
    if (timerRef.current) clearTimeout(timerRef.current);
    callbackRef.current('');
  }

  return (
    <div className="relative flex items-center max-w-xs w-full">
      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        disabled={disabled}
      />
      {valor && (
        <button
          type="button"
          onClick={limpiar}
          className="absolute right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
