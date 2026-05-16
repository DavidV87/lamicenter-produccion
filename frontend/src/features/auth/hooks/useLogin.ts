import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authServicio } from '../services/auth.servicio';
import { useAuthStore } from '../store/auth.store';

interface FormularioLogin {
  email: string;
  password: string;
}

export function useLogin() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navegar = useNavigate();

  async function iniciarSesion(datos: FormularioLogin) {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await authServicio.login(datos);
      setAuth(respuesta);
      navegar('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas');
    } finally {
      setCargando(false);
    }
  }

  return { iniciarSesion, cargando, error };
}
