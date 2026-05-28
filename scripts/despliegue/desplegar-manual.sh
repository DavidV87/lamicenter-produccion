#!/usr/bin/env bash
# =============================================================
# Lamicenter — Script de despliegue manual para Linux
# Plataforma: CentOS / Rocky Linux / AlmaLinux
#
# USO
#   chmod +x scripts/despliegue/desplegar-manual.sh
#   ./scripts/despliegue/desplegar-manual.sh
#
# PRERREQUISITOS (completar ANTES de ejecutar por primera vez):
#   - Node.js 24, PM2, PostgreSQL 18, Nginx instalados en el servidor
#   - Repositorio clonado en DIR_REPO (ver sección de variables abajo)
#   - backend/.env configurado (copiar desde backend/.env.production.example)
#   - frontend/.env.production configurado (VITE_API_URL debe apuntar a este servidor)
#
# Referencia completa: docs/despliegue-linux.md
# =============================================================

# Abortar ante cualquier error, variable sin definir o fallo en pipes
set -euo pipefail


# ==============================================================
# VARIABLES EDITABLES
# Ajustar estas rutas según el servidor de destino antes de ejecutar
# ==============================================================

# Ruta raíz del repositorio en el servidor
DIR_REPO="/opt/lamicenter/repo"

# Subdirectorios derivados (no necesitan cambio si el repo está en DIR_REPO)
DIR_BACKEND="${DIR_REPO}/backend"
DIR_FRONTEND="${DIR_REPO}/frontend"

# Ruta donde Nginx sirve el frontend estático (ver scripts/despliegue/nginx/lamicenter.conf)
DIR_FRONTEND_NGINX="/opt/lamicenter/frontend/dist"

# Nombre de la aplicación en PM2 — debe coincidir con el campo "name" en ecosystem.config.js
PM2_APP="lamicenter-backend"

# Usuario de PostgreSQL para validar conectividad (solo lectura; no ejecuta comandos DDL)
DB_USUARIO="lamicenter_app"
DB_NOMBRE="lamicenter_produccion"

# Versiones mínimas requeridas
NODE_VERSION_MIN=24
NPM_VERSION_MIN=10
PM2_VERSION_MIN=5


# ==============================================================
# HELPERS DE SALIDA
# Funciones internas para formatear mensajes en consola
# ==============================================================

VERDE='\033[0;32m'
ROJO='\033[0;31m'
AMARILLO='\033[1;33m'
AZUL='\033[1;34m'
GRIS='\033[0;37m'
RESET='\033[0m'

# log   → operación exitosa (verde)
# error → fallo fatal, aborta el script (rojo, escribe a stderr)
# aviso → advertencia no fatal, continúa (amarillo)
# paso  → encabezado de cada sección (azul)
# info  → detalle informativo secundario (gris)
log()   { echo -e "${VERDE}  [OK]${RESET}  $*"; }
error() { echo -e "${ROJO}  [ERR]${RESET} $*" >&2; exit 1; }
aviso() { echo -e "${AMARILLO}  [AVS]${RESET} $*"; }
paso()  { echo -e "\n${AZUL}▶ $*${RESET}"; }
info()  { echo -e "${GRIS}       $*${RESET}"; }

# Extrae el número de versión mayor de strings como "v24.1.0" o "10.2.3"
version_mayor() {
  echo "$1" | sed 's/^v//' | cut -d. -f1
}

# Capturar timestamp de inicio para backups y registro de despliegue
FECHA_INICIO=$(date +%Y%m%d_%H%M%S)

echo -e "${AZUL}"
echo "  ╔════════════════════════════════════════════════════╗"
echo "  ║   Lamicenter — Despliegue Manual en Linux          ║"
printf  "  ║   Inicio: %-41s║\n" "$(date '+%Y-%m-%d %H:%M:%S')"
echo "  ╚════════════════════════════════════════════════════╝"
echo -e "${RESET}"


# ==============================================================
# PASO 1 — VALIDAR NODE.JS
# Node.js 24+ es requerido por las dependencias de NestJS y Vite
# ==============================================================
paso "PASO 1 — Validando Node.js"

if ! command -v node &>/dev/null; then
  error "Node.js no encontrado.\n       Instalar: curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash - && sudo dnf install -y nodejs"
fi

NODE_VER=$(node --version)
NODE_MAYOR=$(version_mayor "${NODE_VER}")

if [ "${NODE_MAYOR}" -lt "${NODE_VERSION_MIN}" ]; then
  error "Node.js ${NODE_VER} encontrado pero se requiere v${NODE_VERSION_MIN}+.\n       Actualizar desde: https://nodejs.org"
fi

log "Node.js ${NODE_VER}"


# ==============================================================
# PASO 2 — VALIDAR NPM
# npm 10+ viene incluido con Node.js 24; se valida por separado
# para detectar instalaciones modificadas o degradadas
# ==============================================================
paso "PASO 2 — Validando npm"

if ! command -v npm &>/dev/null; then
  error "npm no encontrado. Viene incluido con Node.js; reinstalar Node.js."
fi

NPM_VER=$(npm --version)
NPM_MAYOR=$(version_mayor "${NPM_VER}")

if [ "${NPM_MAYOR}" -lt "${NPM_VERSION_MIN}" ]; then
  error "npm ${NPM_VER} encontrado pero se requiere ${NPM_VERSION_MIN}+.\n       Actualizar: npm install -g npm@latest"
fi

log "npm ${NPM_VER}"


# ==============================================================
# PASO 3 — VALIDAR PM2
# PM2 5+ gestiona el proceso NestJS como daemon con reinicio automático
# ==============================================================
paso "PASO 3 — Validando PM2"

if ! command -v pm2 &>/dev/null; then
  error "PM2 no encontrado.\n       Instalar: sudo npm install -g pm2"
fi

PM2_VER=$(pm2 --version)
PM2_MAYOR=$(version_mayor "${PM2_VER}")

if [ "${PM2_MAYOR}" -lt "${PM2_VERSION_MIN}" ]; then
  error "PM2 ${PM2_VER} encontrado pero se requiere ${PM2_VERSION_MIN}+.\n       Actualizar: sudo npm install -g pm2@latest"
fi

log "PM2 ${PM2_VER}"


# ==============================================================
# PASO 4 — VALIDAR POSTGRESQL
# Las migraciones (paso 8) requieren que PostgreSQL esté activo.
# Se valida aquí para detectar el problema antes del build.
# ==============================================================
paso "PASO 4 — Validando PostgreSQL"

# Intentar con systemctl primero (servicio estándar en RHEL/CentOS con repo oficial)
if systemctl is-active --quiet postgresql-18 2>/dev/null; then
  log "Servicio postgresql-18 activo"
elif command -v pg_isready &>/dev/null; then
  # Fallback: pg_isready funciona si el servicio tiene otro nombre
  if pg_isready -U "${DB_USUARIO}" -d "${DB_NOMBRE}" -q 2>/dev/null; then
    log "PostgreSQL responde (pg_isready OK)"
  else
    aviso "PostgreSQL no responde para ${DB_USUARIO}@${DB_NOMBRE}."
    aviso "Las migraciones del paso 8 fallarán si la BD no está disponible."
    aviso "Verificar con: sudo systemctl status postgresql-18"
  fi
else
  aviso "No se pudo confirmar el estado de PostgreSQL (systemctl y pg_isready fallaron)."
  aviso "Verificar manualmente antes de continuar."
fi

# Validar que el directorio del repositorio existe
if [ ! -d "${DIR_REPO}" ]; then
  error "Repositorio no encontrado en ${DIR_REPO}.\n       Clonar con: git clone <URL> ${DIR_REPO}"
fi
log "Repositorio presente: ${DIR_REPO}"

# Validar que el .env del backend existe antes de continuar
# (es necesario para prisma migrate deploy y para que PM2 arranque correctamente)
if [ ! -f "${DIR_BACKEND}/.env" ]; then
  error "${DIR_BACKEND}/.env no encontrado.\n       Crear desde la plantilla:\n         cp ${DIR_BACKEND}/.env.production.example ${DIR_BACKEND}/.env\n       Completar DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET y CORS_ORIGIN."
fi
log ".env del backend presente"

# Advertir si falta el .env.production del frontend (no es fatal: el build usa defaults)
if [ ! -f "${DIR_FRONTEND}/.env.production" ]; then
  aviso "${DIR_FRONTEND}/.env.production no encontrado."
  aviso "El frontend se compilará sin VITE_API_URL correcto y no podrá alcanzar la API."
  aviso "Crear desde plantilla: cp ${DIR_FRONTEND}/.env.production.example ${DIR_FRONTEND}/.env.production"
fi


# ==============================================================
# PASO 5 — GIT PULL
# Actualizar el código fuente desde la rama actual del repositorio
# ==============================================================
paso "PASO 5 — Actualizando código fuente (git pull)"

cd "${DIR_REPO}"

RAMA_ACTUAL=$(git rev-parse --abbrev-ref HEAD)
COMMIT_ANTERIOR=$(git rev-parse --short HEAD)

info "Rama:           ${RAMA_ACTUAL}"
info "Commit actual:  ${COMMIT_ANTERIOR}"

# Hacer backup antes de traer cambios (se hace aquí para capturar estado pre-pull)
# ── Backup previo ─────────────────────────────────────────────
DIR_BACKUPS="${DIR_REPO}/../backups"
DIR_BACKUP_HOY="${DIR_BACKUPS}/${FECHA_INICIO}"
mkdir -p "${DIR_BACKUP_HOY}"
info "Directorio de backup: ${DIR_BACKUP_HOY}"

# Backup de base de datos: pg_dump antes de cualquier migración
if pg_dump -U "${DB_USUARIO}" "${DB_NOMBRE}" > "${DIR_BACKUP_HOY}/db_backup.sql" 2>/dev/null; then
  log "Backup BD: ${DIR_BACKUP_HOY}/db_backup.sql"
else
  aviso "pg_dump falló — backup de BD omitido. Continuar bajo tu responsabilidad."
fi

# Backup del dist/ compilado del backend (permite rollback sin recompilar)
if [ -d "${DIR_BACKEND}/dist" ]; then
  cp -r "${DIR_BACKEND}/dist" "${DIR_BACKUP_HOY}/backend_dist"
  log "Backup dist backend guardado"
fi

# Backup del .env del backend (no versionar en git; el backup es la copia de seguridad)
cp "${DIR_BACKEND}/.env" "${DIR_BACKUP_HOY}/backend_env.bak"
log "Backup .env guardado"

# Backup del frontend estático que sirve Nginx actualmente
if [ -d "${DIR_FRONTEND_NGINX}" ]; then
  cp -r "${DIR_FRONTEND_NGINX}" "${DIR_BACKUP_HOY}/frontend_dist"
  log "Backup dist frontend guardado"
fi

# Ahora sí: traer cambios del remoto
git pull origin "${RAMA_ACTUAL}"

COMMIT_NUEVO=$(git rev-parse --short HEAD)
if [ "${COMMIT_ANTERIOR}" = "${COMMIT_NUEVO}" ]; then
  aviso "Sin cambios nuevos en '${RAMA_ACTUAL}' (ya en ${COMMIT_NUEVO})."
else
  log "Código actualizado: ${COMMIT_ANTERIOR} → ${COMMIT_NUEVO}"
fi


# ==============================================================
# PASO 6 — INSTALAR DEPENDENCIAS DEL BACKEND
# npm ci respeta exactamente el package-lock.json
# --omit=dev excluye devDependencies para reducir el tamaño en producción
# ==============================================================
paso "PASO 6 — Instalando dependencias del backend"

cd "${DIR_BACKEND}"
npm ci --omit=dev
log "Dependencias backend instaladas"


# ==============================================================
# PASO 7 — GENERAR CLIENTE PRISMA
# Regenerar el cliente Prisma a partir del schema.prisma actual.
# Necesario después de cualquier cambio en el schema o en la versión de @prisma/client.
# ==============================================================
paso "PASO 7 — Generando cliente Prisma"

cd "${DIR_BACKEND}"
npx prisma generate
log "Prisma Client generado"


# ==============================================================
# PASO 8 — EJECUTAR MIGRACIONES (deploy)
# prisma migrate deploy aplica migraciones pendientes de forma incremental.
# Es idempotente: si no hay migraciones nuevas, no hace nada.
# NUNCA usar prisma migrate dev en el servidor de producción.
# ==============================================================
paso "PASO 8 — Ejecutando migraciones de base de datos"

cd "${DIR_BACKEND}"
npx prisma migrate deploy
log "Migraciones aplicadas"


# ==============================================================
# PASO 9 — COMPILAR BACKEND
# nest build transpila TypeScript a JavaScript en dist/src/
# El tsconfig no define rootDir, por eso NestJS genera dist/src/main.js
# (no dist/main.js — ver nota en ecosystem.config.js)
# ==============================================================
paso "PASO 9 — Compilando backend (nest build)"

cd "${DIR_BACKEND}"
npm run build

# Verificar que el artefacto principal existe tras el build
if [ ! -f "${DIR_BACKEND}/dist/src/main.js" ]; then
  error "Build fallido: ${DIR_BACKEND}/dist/src/main.js no encontrado."
fi
log "Backend compilado: dist/src/main.js"


# ==============================================================
# PASO 10 — INSTALAR DEPENDENCIAS DEL FRONTEND
# El frontend instala todas las dependencias (incluyendo devDependencies)
# porque TypeScript y Vite son necesarios en tiempo de compilación
# ==============================================================
paso "PASO 10 — Instalando dependencias del frontend"

cd "${DIR_FRONTEND}"
npm ci
log "Dependencias frontend instaladas"


# ==============================================================
# PASO 11 — COMPILAR FRONTEND
# tsc + vite build generan el bundle estático en frontend/dist/
# Las variables VITE_* se leen de .env.production y quedan EMBEBIDAS
# en el bundle — si cambia la IP del servidor, hay que recompilar
# ==============================================================
paso "PASO 11 — Compilando frontend (tsc + vite build)"

cd "${DIR_FRONTEND}"
npm run build

if [ ! -f "${DIR_FRONTEND}/dist/index.html" ]; then
  error "Build del frontend fallido: dist/index.html no encontrado."
fi
log "Frontend compilado: dist/index.html"

# Copiar el bundle al directorio que sirve Nginx
# DIR_FRONTEND_NGINX es distinto del repo para que Nginx no tenga acceso
# a archivos de configuración o código fuente del repositorio
info "Copiando dist/ → ${DIR_FRONTEND_NGINX}"
mkdir -p "${DIR_FRONTEND_NGINX}"

# Limpiar build anterior para evitar archivos huérfanos (assets con hash viejo)
# La variable tiene :? como salvaguarda: falla si DIR_FRONTEND_NGINX está vacía
rm -rf "${DIR_FRONTEND_NGINX:?}/"*

cp -r "${DIR_FRONTEND}/dist/." "${DIR_FRONTEND_NGINX}/"
log "Frontend copiado a ${DIR_FRONTEND_NGINX}"

# Ajustar propietario para que el proceso nginx pueda leer los archivos
if id "nginx" &>/dev/null 2>&1; then
  chown -R nginx:nginx "${DIR_FRONTEND_NGINX}" 2>/dev/null || \
    aviso "No se pudo cambiar propietario de ${DIR_FRONTEND_NGINX}.\n       Ejecutar manualmente: sudo chown -R nginx:nginx ${DIR_FRONTEND_NGINX}"
fi


# ==============================================================
# PASO 12 — CREAR CARPETA DE LOGS
# PM2 escribe logs en backend/logs/ según ecosystem.config.js:
#   error_file: 'logs/error.log'
#   out_file:   'logs/out.log'
# El directorio debe existir antes de que PM2 intente escribir
# ==============================================================
paso "PASO 12 — Creando directorio de logs del backend"

mkdir -p "${DIR_BACKEND}/logs"
log "Directorio de logs: ${DIR_BACKEND}/logs"


# ==============================================================
# PASO 13 — REINICIAR PM2
# Si el proceso ya existe en PM2: restart con --update-env para
# que cargue posibles cambios en .env sin hacer stop + start.
# Si es la primera vez: start desde ecosystem.config.js y guardar.
# ==============================================================
paso "PASO 13 — Reiniciando PM2 (${PM2_APP})"

cd "${DIR_BACKEND}"

if pm2 describe "${PM2_APP}" &>/dev/null 2>&1; then
  # Proceso ya registrado en PM2 → reiniciar recargando variables de entorno
  pm2 restart "${PM2_APP}" --update-env
  log "PM2 reiniciado: ${PM2_APP} (--update-env)"
else
  # Primera ejecución → iniciar desde el archivo de configuración
  # ecosystem.config.js usa __dirname como cwd, por lo que la ruta
  # del script (dist/src/main.js) se resuelve correctamente
  pm2 start ecosystem.config.js --env production
  pm2 save
  log "PM2 iniciado desde ecosystem.config.js y lista guardada"
fi


# ==============================================================
# PASO 14 — ESTADO FINAL Y REGISTRO
# ==============================================================
paso "PASO 14 — Estado final"

# Registrar despliegue en el log histórico del servidor
COMMIT_FINAL=$(git -C "${DIR_REPO}" rev-parse --short HEAD)
RAMA_FINAL=$(git -C "${DIR_REPO}"  rev-parse --abbrev-ref HEAD)
LOG_DESPLIEGUES="${DIR_BACKUPS}/despliegues.log"

mkdir -p "${DIR_BACKUPS}"
echo "${FECHA_INICIO} | rama=${RAMA_FINAL} | commit=${COMMIT_FINAL} | backup=${DIR_BACKUP_HOY}" \
  >> "${LOG_DESPLIEGUES}" 2>/dev/null || \
  aviso "No se pudo escribir en ${LOG_DESPLIEGUES} (permisos). Registrar manualmente."

info "Registro de despliegue: ${LOG_DESPLIEGUES}"

# Mostrar estado actual de todos los procesos PM2
pm2 status

echo ""
echo -e "${VERDE}"
echo "  ╔════════════════════════════════════════════════════╗"
echo "  ║   Despliegue completado exitosamente               ║"
printf  "  ║   Commit: %-41s║\n" "${COMMIT_FINAL}"
printf  "  ║   Rama:   %-41s║\n" "${RAMA_FINAL}"
echo "  ╚════════════════════════════════════════════════════╝"
echo -e "${RESET}"

echo "  Validación post-despliegue:"
echo "    1. Ver logs:   pm2 logs ${PM2_APP} --lines 50"
echo "    2. Probar API: curl http://localhost:3000/api/v1/"
echo "    3. Probar UI:  Abrir http://<IP_SERVIDOR> en el navegador"
echo "    4. Checklist:  docs/despliegue-linux.md § 8"
echo ""
