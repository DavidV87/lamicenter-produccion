// =============================================================
// Lamicenter — Configuración PM2 para producción Linux
//
// Uso:
//   pm2 start ecosystem.config.js --env production
//   pm2 save
//
// Crear directorio de logs antes del primer arranque:
//   mkdir -p /opt/lamicenter/repo/backend/logs
//
// Referencia: docs/despliegue-linux.md § 5 — PM2
// =============================================================

module.exports = {
  apps: [
    {
      // ── Identidad ───────────────────────────────────────────
      name: 'lamicenter-backend',

      // dist/src/main.js — NestJS compila a dist/src/ porque el tsconfig
      // no define rootDir y Vite preserva la estructura de src/
      script: 'dist/src/main.js',

      // Directorio de trabajo: raíz del backend donde vive .env y dist/
      // __dirname resuelve la ruta absoluta independiente de desde dónde
      // se invoque pm2, evitando rutas hardcodeadas al servidor
      cwd: __dirname,

      // ── Modo de ejecución ───────────────────────────────────
      instances: 1,
      exec_mode: 'fork',

      // ── Reinicio automático ─────────────────────────────────
      autorestart: true,
      // Espera 4 s antes de reiniciar tras caída (evita bucles de crash rápido)
      restart_delay: 4000,
      // Proceso considerado estable si lleva al menos 10 s activo
      min_uptime: '10s',
      // Máximo de reinicios automáticos antes de marcar como errored
      max_restarts: 10,

      // No vigilar cambios de archivos en producción
      watch: false,

      // ── Límite de memoria ───────────────────────────────────
      max_memory_restart: '512M',

      // ── Logs ────────────────────────────────────────────────
      // Rutas relativas a cwd (/opt/lamicenter/repo/backend/logs/)
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      // No fusionar stdout y stderr en un único archivo
      merge_logs: false,
      // Prefijo ISO-8601 en cada línea de log (PM2 v5+)
      time: true,

      // ── Variables de entorno ────────────────────────────────
      // env: aplicado siempre (base)
      env: {
        NODE_ENV: 'production',
      },
      // env_production: activado con --env production (complementa env)
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
