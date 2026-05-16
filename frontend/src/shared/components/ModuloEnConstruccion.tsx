import { Construction } from 'lucide-react';

interface Props {
  nombre: string;
}

export function ModuloEnConstruccion({ nombre }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-marca-dorado/50 bg-marca-dorado/10">
        <Construction size={28} className="text-marca-primario" />
      </div>
      <h2 className="text-xl font-bold text-marca-negro font-poppins">{nombre}</h2>
      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        Este módulo está en construcción y estará disponible próximamente.
      </p>
      <div className="h-0.5 w-16 bg-marca-dorado rounded-full" />
    </div>
  );
}
