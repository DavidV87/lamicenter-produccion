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

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'secreto_acceso_no_configurado_cambiar',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'secreto_refresh_no_configurado_cambiar',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
}));
