import { registerAs } from '@nestjs/config';

/**
 * Configuración centralizada de la aplicación.
 * Cargada desde variables de entorno definidas en .env.
 * Accesible vía ConfigService con la clave 'aplicacion'.
 */
export default registerAs('aplicacion', () => ({
  entorno: process.env.NODE_ENV || 'development',
  puerto: parseInt(process.env.PORT || '3000', 10),
  prefijoApi: process.env.API_PREFIX || 'api/v1',
  nombreApp: process.env.APP_NAME || 'Lamicenter API',
  corsOrigen: process.env.CORS_ORIGIN || 'http://localhost:5173',

  baseDatos: {
    url: process.env.DATABASE_URL,
  },

  // Reservado para implementación futura del módulo de seguridad
  jwt: {
    secreto: process.env.JWT_SECRET,
    expiracion: process.env.JWT_EXPIRES_IN || '8h',
    expiracionRefresh: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
}));
