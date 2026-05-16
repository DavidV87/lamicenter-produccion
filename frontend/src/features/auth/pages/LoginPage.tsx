import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate } from 'react-router-dom';
import { useLogin } from '../hooks/useLogin';
import { useAuthStore } from '../store/auth.store';
import { Button } from '@/shared/components/ui/button';

const esquema = z.object({
  email:    z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type FormularioLogin = z.infer<typeof esquema>;

const clsInput =
  'flex h-11 w-full rounded border border-marca-gris bg-white px-3 py-2 text-sm ' +
  'placeholder:text-marca-gris/80 ' +
  'focus:outline-none focus:ring-2 focus:ring-marca-primario focus:border-transparent ' +
  'disabled:cursor-not-allowed disabled:opacity-50 font-poppins';

export function LoginPage() {
  const token = useAuthStore((s) => s.accessToken);
  const { iniciarSesion, cargando, error } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioLogin>({ resolver: zodResolver(esquema) });

  if (token) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-marca-negro flex flex-col items-center justify-center px-4">

      {/* ── Marca ─────────────────────────────────────────────────────── */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-widest text-white font-poppins">
          LAMICENTER
        </h1>
        <p className="mt-2 text-sm text-marca-gris font-light tracking-wide">
          Sistema de Control de Producción
        </p>
      </div>

      {/* ── Card de login ─────────────────────────────────────────────── */}
      <div className="w-full max-w-sm rounded-lg bg-white shadow-2xl overflow-hidden">

        {/* Banda dorada superior */}
        <div className="h-1 w-full bg-marca-dorado" />

        <div className="px-8 py-8">
          <h2 className="mb-6 text-lg font-semibold text-marca-negro">
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit(iniciarSesion)} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-marca-negro" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={clsInput}
                placeholder="usuario@lamicenter.local"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-marca-rojo">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-marca-negro" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className={clsInput}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-marca-rojo">{errors.password.message}</p>
              )}
            </div>

            {/* Error de servidor */}
            {error && (
              <div className="rounded border border-marca-rojo/30 bg-marca-rojo/8 px-3 py-2.5">
                <p className="text-sm text-marca-rojo font-medium">{error}</p>
              </div>
            )}

            {/* Botón */}
            <Button
              type="submit"
              disabled={cargando}
              className="w-full h-11 bg-marca-primario text-white hover:bg-marca-primario/90 font-semibold tracking-wide"
            >
              {cargando ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-marca-gris/60">
        © {new Date().getFullYear()} Lamicenter S.A.S. — Todos los derechos reservados
      </p>
    </div>
  );
}
