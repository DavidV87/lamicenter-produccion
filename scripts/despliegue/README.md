# Scripts de Despliegue — Lamicenter

Este directorio contiene (o contendrá) scripts de automatización para el despliegue
de Lamicenter en el servidor Linux LAN/VPN.

## Estado actual

Los scripts aquí son de referencia y apoyo al proceso manual documentado en
`docs/despliegue-linux.md`. Ejecutar siempre la guía completa antes de usar
cualquier script de este directorio.

## Estructura esperada

```
scripts/despliegue/
├── README.md              ← este archivo
├── 01-preparar-servidor.sh    (futuro) instalación de dependencias en servidor limpio
├── 02-build-backend.sh        (futuro) compilación y copia del backend
├── 03-build-frontend.sh       (futuro) compilación y copia del frontend
├── 04-migraciones.sh          (futuro) ejecución de prisma migrate deploy
├── 05-reiniciar-pm2.sh        (futuro) restart graceful de PM2
└── rollback.sh                (futuro) rollback a versión anterior
```

## Prerrequisitos para ejecutar scripts

- Conexión SSH al servidor Linux con usuario con privilegios sudo
- Node.js 24 instalado en el servidor
- PM2 instalado globalmente (`npm install -g pm2`)
- PostgreSQL 18 instalado y en ejecución
- Nginx instalado y configurado

## Convenciones

- Los scripts deben ser idempotentes: ejecutarlos dos veces no debe producir efectos
  negativos ni datos duplicados.
- Antes de cualquier script de build, realizar backup de la BD:
  `pg_dump -U lamicenter_app lamicenter_produccion > backup_$(date +%Y%m%d_%H%M%S).sql`
- Registrar la fecha y versión (hash de commit) de cada despliegue en un archivo
  `despliegues.log` en el servidor.

## Referencia rápida de comandos manuales

Ver `docs/despliegue-linux.md` para el procedimiento completo paso a paso.

```bash
# Backup BD antes de desplegar
pg_dump -U lamicenter_app lamicenter_produccion > backup_$(date +%Y%m%d_%H%M%S).sql

# Build backend
cd /opt/lamicenter/repo/backend
npm ci --omit=dev
npx prisma generate
npm run build
# Salida compilada en: dist/src/main.js

# Migraciones
npx prisma migrate deploy

# Reiniciar servicio
pm2 restart lamicenter-api

# Build frontend (en máquina de desarrollo o CI)
cd frontend
npm ci
npm run build
# Copiar dist/ al servidor Nginx
```
