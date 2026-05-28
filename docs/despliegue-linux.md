# Despliegue Linux — Lamicenter Producción (LAN/VPN)

Guía de despliegue para el sistema Lamicenter en servidor Linux (CentOS / Rocky Linux /
AlmaLinux) en red local (LAN) o VPN corporativa.

**Arquitectura objetivo:**

```
Cliente (navegador LAN/VPN)
        │  HTTP :80
        ▼
    [ Nginx ]
    ├── /          → sirve frontend estático (React/Vite dist/)
    └── /api/v1/   → proxy inverso → localhost:3000
                                          │
                                    [ PM2 / NestJS ]
                                          │
                                    [ PostgreSQL 18 ]
```

---

## Índice

1. [Prerrequisitos del servidor](#1-prerrequisitos-del-servidor)
2. [PostgreSQL — configuración inicial](#2-postgresql--configuración-inicial)
3. [Build del backend](#3-build-del-backend)
4. [Build del frontend](#4-build-del-frontend)
5. [PM2 — configuración y arranque](#5-pm2--configuración-y-arranque)
6. [Nginx — configuración](#6-nginx--configuración)
7. [Variables de entorno en producción](#7-variables-de-entorno-en-producción)
8. [Checklist de validación LAN/VPN](#8-checklist-de-validación-lanvpn)
9. [Checklist de rollback](#9-checklist-de-rollback)

---

## 1. Prerrequisitos del servidor

### Sistema operativo

CentOS 8+ / Rocky Linux 8+ / AlmaLinux 8+

### Software requerido

| Componente    | Versión mínima | Comando de verificación         |
|---------------|----------------|---------------------------------|
| Node.js       | 24.x LTS       | `node --version`                |
| npm           | 10+            | `npm --version`                 |
| PM2           | 5+             | `pm2 --version`                 |
| PostgreSQL    | 18             | `psql --version`                |
| Nginx         | 1.20+          | `nginx -v`                      |
| Git           | 2+             | `git --version`                 |

### Instalación de Node.js 24 (vía NodeSource)

```bash
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo dnf install -y nodejs
node --version   # debe mostrar v24.x.x
```

### Instalación de PM2

```bash
sudo npm install -g pm2
pm2 --version
```

### Instalación de Nginx

```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

---

## 2. PostgreSQL — configuración inicial

> Solo ejecutar en el primer despliegue. En actualizaciones posteriores ir directamente
> al paso de migraciones dentro de la sección 3.

### 2.1 Instalar PostgreSQL 18

```bash
# Repositorio oficial de PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-8-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf -qy module disable postgresql
sudo dnf install -y postgresql18-server postgresql18

# Inicializar cluster
sudo /usr/pgsql-18/bin/postgresql-18-setup initdb
sudo systemctl enable postgresql-18
sudo systemctl start postgresql-18
```

### 2.2 Crear usuario y base de datos de la aplicación

```bash
sudo -u postgres psql << 'EOF'
-- Usuario de la aplicación (sin superusuario)
CREATE USER lamicenter_app WITH PASSWORD 'CONTRASEÑA_SEGURA_AQUI';

-- Base de datos
CREATE DATABASE lamicenter_produccion
  OWNER lamicenter_app
  ENCODING 'UTF8'
  LC_COLLATE 'es_CO.UTF-8'
  LC_CTYPE 'es_CO.UTF-8'
  TEMPLATE template0;

-- Permisos
GRANT ALL PRIVILEGES ON DATABASE lamicenter_produccion TO lamicenter_app;
GRANT ALL ON SCHEMA public TO lamicenter_app;
EOF
```

> **Nota:** Si el locale `es_CO.UTF-8` no está disponible en el servidor, usar
> `en_US.UTF-8`. Verificar con: `locale -a | grep -i es_co`

### 2.3 Configurar pg_hba.conf para acceso local

Editar `/var/lib/pgsql/18/data/pg_hba.conf` y asegurar que exista esta línea:

```
# TYPE  DATABASE                USER            ADDRESS         METHOD
local   lamicenter_produccion   lamicenter_app                  md5
host    lamicenter_produccion   lamicenter_app  127.0.0.1/32    md5
```

Recargar PostgreSQL después de editar:

```bash
sudo systemctl reload postgresql-18
```

### 2.4 Verificar conexión

```bash
psql -U lamicenter_app -d lamicenter_produccion -h 127.0.0.1 -c "SELECT version();"
```

---

## 3. Build del backend

### 3.1 Clonar o copiar código al servidor

```bash
sudo mkdir -p /opt/lamicenter
sudo chown $USER:$USER /opt/lamicenter

# Opción A — clonar desde Git
git clone https://github.com/ORG/lamicenter-produccion.git /opt/lamicenter/repo
cd /opt/lamicenter/repo/backend

# Opción B — copiar desde máquina de desarrollo (SCP/SFTP)
# scp -r ./backend usuario@192.168.1.100:/opt/lamicenter/
```

### 3.2 Configurar variables de entorno

```bash
cd /opt/lamicenter/repo/backend   # o la ruta donde está el backend

# Copiar la plantilla de producción
cp .env.production.example .env

# Editar con los valores reales del servidor
nano .env
```

Variables críticas a ajustar en `.env`:

| Variable            | Valor en producción                                         |
|---------------------|-------------------------------------------------------------|
| `NODE_ENV`          | `production`                                                |
| `PORT`              | `3000`                                                      |
| `DATABASE_URL`      | `postgresql://lamicenter_app:PASSWORD@localhost:5432/lamicenter_produccion?schema=public` |
| `CORS_ORIGIN`       | IP o hostname del servidor en LAN (ej. `http://192.168.1.100`) |
| `JWT_ACCESS_SECRET` | cadena hexadecimal aleatoria ≥ 64 bytes                     |
| `JWT_REFRESH_SECRET`| cadena hexadecimal aleatoria distinta ≥ 64 bytes            |

Generar secretos JWT seguros:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3.3 Instalar dependencias de producción

```bash
cd /opt/lamicenter/repo/backend
npm ci --omit=dev
```

> `npm ci` garantiza que las versiones del `package-lock.json` se respetan exactamente.
> `--omit=dev` excluye dependencias de desarrollo para reducir el bundle.

### 3.4 Generar cliente Prisma

```bash
npx prisma generate
```

### 3.5 Compilar TypeScript → JavaScript

```bash
npm run build
# Equivale a: nest build
# Salida en: dist/
```

Verificar que la compilación fue exitosa:

```bash
ls -la dist/src/
# Debe existir dist/src/main.js
```

### 3.6 Ejecutar migraciones de base de datos

```bash
npx prisma migrate deploy
```

> **Importante:** `migrate deploy` aplica migraciones pendientes en producción sin
> crear nuevas. Es idempotente y seguro para re-ejecutar.
> NO usar `migrate dev` en el servidor de producción.

### 3.7 Ejecutar seed inicial (solo primer despliegue)

```bash
# Solo en el primer despliegue o si se requiere reinicializar datos base
npm run prisma:seed
```

> **Advertencia:** El seed puede sobrescribir o duplicar datos si se ejecuta más de
> una vez. Revisar el script `prisma/seed.ts` antes de ejecutarlo en un servidor
> con datos reales.

---

## 4. Build del frontend

> El frontend se puede construir tanto en el servidor de producción como en la máquina
> de desarrollo y luego copiar el directorio `dist/` al servidor.
> **Opción recomendada para LAN:** construir en desarrollo, copiar `dist/` al servidor.

### 4.1 Configurar variable de entorno de producción

En la máquina donde se realiza el build:

```bash
cd frontend

# Copiar la plantilla de producción
cp .env.production.example .env.production

# Editar VITE_API_URL con la IP/hostname del servidor
# VITE_API_URL=http://192.168.1.100/api/v1
nano .env.production
```

> Las variables `VITE_*` quedan **embebidas en el bundle estático** en tiempo de build.
> Si cambia la IP del servidor, se debe reconstruir el frontend.

### 4.2 Instalar dependencias y compilar

```bash
cd frontend
npm ci
npm run build
# Equivale a: tsc && vite build
# Salida en: dist/
```

Verificar que el build fue exitoso:

```bash
ls -la dist/
# Debe existir dist/index.html y dist/assets/
```

> **Nota:** Vite puede mostrar el warning `Some chunks are larger than 500 kB after
> minification` — es informativo, no impide el despliegue. El bundle funciona
> correctamente. Para mejorarlo en el futuro, evaluar code-splitting con `React.lazy`.



### 4.3 Copiar dist/ al servidor

```bash
# Desde la máquina de desarrollo
scp -r frontend/dist/ usuario@192.168.1.100:/opt/lamicenter/frontend/

# O si se construyó directamente en el servidor:
# El dist/ ya está en /opt/lamicenter/repo/frontend/dist/
```

Ruta en el servidor donde Nginx servirá los archivos estáticos:

```
/opt/lamicenter/frontend/dist/
```

Asegurar permisos correctos:

```bash
sudo chown -R nginx:nginx /opt/lamicenter/frontend/dist/
sudo chmod -R 755 /opt/lamicenter/frontend/dist/
```

---

## 5. PM2 — configuración y arranque

### 5.1 Crear archivo de configuración PM2

> **Nota de ruta:** El tsconfig del backend no define `rootDir`, por lo que `nest build`
> genera el código compilado en `dist/src/main.js` (no en `dist/main.js`).
> El script `start:prod` del `package.json` apunta a `dist/main` y deberá actualizarse
> antes del primer despliegue, o usar la ruta directa en PM2 como se muestra abajo.

Crear `/opt/lamicenter/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'lamicenter-api',
      script: '/opt/lamicenter/repo/backend/dist/src/main.js',
      cwd: '/opt/lamicenter/repo/backend',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
      },
      watch: false,
      max_memory_restart: '512M',
      error_file: '/var/log/lamicenter/pm2-error.log',
      out_file: '/var/log/lamicenter/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

Crear directorio de logs:

```bash
sudo mkdir -p /var/log/lamicenter
sudo chown $USER:$USER /var/log/lamicenter
```

### 5.2 Iniciar la aplicación con PM2

```bash
cd /opt/lamicenter
pm2 start ecosystem.config.js --env production
pm2 save
```

### 5.3 Configurar PM2 para arrancar con el sistema

```bash
pm2 startup
# Ejecutar el comando que PM2 imprime (requiere sudo)
pm2 save
```

### 5.4 Verificar que el backend está corriendo

```bash
pm2 status
pm2 logs lamicenter-api --lines 50
curl http://localhost:3000/api/v1/health   # si existe endpoint de health
```

### 5.5 Comandos PM2 útiles

```bash
pm2 restart lamicenter-api    # reiniciar sin downtime (graceful)
pm2 reload lamicenter-api     # recarga en caliente (cluster mode)
pm2 stop lamicenter-api       # detener
pm2 logs lamicenter-api       # ver logs en tiempo real
pm2 monit                     # monitor interactivo
```

---

## 6. Nginx — configuración

### 6.1 Crear configuración del sitio

Crear `/etc/nginx/conf.d/lamicenter.conf`:

```nginx
server {
    listen 80;
    server_name 192.168.1.100;   # Reemplazar con IP o hostname real del servidor

    # ── Frontend estático ────────────────────────────────────────
    root /opt/lamicenter/frontend/dist;
    index index.html;

    # SPA: redirigir rutas desconocidas al index.html de React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # ── API — proxy inverso al backend NestJS ────────────────────
    location /api/ {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # ── Archivos estáticos — caché largo ─────────────────────────
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # ── Seguridad básica ─────────────────────────────────────────
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    # Ocultar versión de Nginx
    server_tokens off;

    # ── Logs ─────────────────────────────────────────────────────
    access_log /var/log/nginx/lamicenter-access.log;
    error_log  /var/log/nginx/lamicenter-error.log warn;
}
```

### 6.2 Validar y recargar Nginx

```bash
sudo nginx -t        # validar sintaxis — debe imprimir "syntax is ok"
sudo systemctl reload nginx
```

### 6.3 Configurar firewall

```bash
# Abrir puerto HTTP en la LAN
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload

# Verificar reglas activas
sudo firewall-cmd --list-all
```

> **Nota de seguridad:** El puerto 3000 del backend NO debe exponerse directamente a la
> red. Nginx actúa como único punto de entrada. Verificar que el firewall bloquea
> el acceso externo al puerto 3000.

```bash
# Asegurar que el puerto 3000 solo es accesible desde localhost
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" port port="3000" protocol="tcp" reject'
sudo firewall-cmd --reload
```

---

## 7. Variables de entorno en producción

### Backend (`.env` en `/opt/lamicenter/repo/backend/`)

Ver plantilla completa en `backend/.env.production.example`.

Resumen de variables críticas:

| Variable              | Descripción                                        |
|-----------------------|----------------------------------------------------|
| `NODE_ENV`            | Debe ser `production`                              |
| `PORT`                | Puerto del backend (3000 por defecto)              |
| `DATABASE_URL`        | Cadena de conexión PostgreSQL con credenciales     |
| `CORS_ORIGIN`         | IP/hostname del servidor (donde corre Nginx)       |
| `JWT_ACCESS_SECRET`   | Secreto para firmar tokens de acceso               |
| `JWT_REFRESH_SECRET`  | Secreto para firmar tokens de refresco             |
| `JWT_ACCESS_EXPIRES_IN`  | Expiración token acceso (ej. `15m`)             |
| `JWT_REFRESH_EXPIRES_IN` | Expiración token refresco (ej. `7d`)            |
| `BCRYPT_SALT_ROUNDS`  | Rondas de hash de contraseñas (12 recomendado)     |

### Frontend (`.env.production` — solo en tiempo de build)

Ver plantilla en `frontend/.env.production.example`.

| Variable        | Descripción                                              |
|-----------------|----------------------------------------------------------|
| `VITE_API_URL`  | URL completa de la API: `http://IP_SERVIDOR/api/v1`      |
| `VITE_APP_NAME` | Nombre mostrado en la UI                                 |

> Las variables `VITE_*` se embeben en el bundle en tiempo de build. Son visibles
> en el JavaScript del cliente. No colocar secretos aquí.

---

## 8. Checklist de validación LAN/VPN

Ejecutar después de cada despliegue nuevo o actualización.

### Infraestructura

- [ ] PostgreSQL 18 en ejecución: `sudo systemctl status postgresql-18`
- [ ] PM2 con `lamicenter-api` en estado `online`: `pm2 status`
- [ ] Nginx en ejecución: `sudo systemctl status nginx`
- [ ] Puerto 80 accesible desde la LAN: `curl http://192.168.1.100/`
- [ ] Puerto 3000 NO accesible desde la LAN (solo localhost)

### Backend

- [ ] `dist/src/main.js` existe: `ls -la /opt/lamicenter/repo/backend/dist/src/main.js`
- [ ] Variables de entorno cargadas: `pm2 env 0 | grep NODE_ENV` (debe mostrar `production`)
- [ ] Logs sin errores críticos: `pm2 logs lamicenter-api --lines 100`
- [ ] Migraciones aplicadas: `cd /opt/lamicenter/repo/backend && npx prisma migrate status`
- [ ] API responde: `curl http://localhost:3000/api/v1/` (debe retornar JSON, no HTML de error)

### Frontend

- [ ] `dist/index.html` existe en la ruta configurada en Nginx
- [ ] Aplicación carga en navegador: navegar a `http://192.168.1.100`
- [ ] Sin errores en consola del navegador (F12 → Console)
- [ ] Las llamadas a `/api/v1/` retornan 200 (F12 → Network)

### Funcionalidad básica

- [ ] Login de usuario funciona
- [ ] Módulo Catálogo carga (clientes, ítems, proveedores)
- [ ] Módulo Pedidos carga y permite crear un pedido de prueba
- [ ] Módulo Producción carga y muestra órdenes
- [ ] Módulo Despacho carga
- [ ] Módulo PQRS carga
- [ ] Módulo Reportes carga y muestra datos del dashboard

### Auditoría y trazabilidad

- [ ] Al crear/modificar un registro, se genera entrada en `auditoria_general`
- [ ] Cambio de estado registra en `historial_estados`

---

## 9. Checklist de rollback

En caso de fallo durante o después del despliegue, seguir estos pasos en orden.

### 9.1 Rollback del backend

```bash
# 1. Detener el servicio
pm2 stop lamicenter-api

# 2. Restaurar el código anterior
#    (tener siempre una copia del dist/ anterior en /opt/lamicenter/backups/)
cp -r /opt/lamicenter/backups/FECHA/backend_dist/ /opt/lamicenter/repo/backend/dist/

# 3. Restaurar .env si fue modificado
cp /opt/lamicenter/backup/backend/.env /opt/lamicenter/repo/backend/.env

# 4. Reiniciar
pm2 start lamicenter-api
pm2 logs lamicenter-api --lines 50
```

### 9.2 Rollback de base de datos

```bash
# Solo si las migraciones causaron el problema

# 1. Detener backend para evitar escrituras
pm2 stop lamicenter-api

# 2. Restaurar backup (generado ANTES del despliegue)
psql -U lamicenter_app -d postgres -c "DROP DATABASE lamicenter_produccion;"
psql -U lamicenter_app -d postgres -c "CREATE DATABASE lamicenter_produccion OWNER lamicenter_app;"
psql -U lamicenter_app -d lamicenter_produccion < /opt/lamicenter/backups/backup_YYYYMMDD_HHMMSS.sql

# 3. Reiniciar backend con código anterior
pm2 start lamicenter-api
```

### 9.3 Rollback del frontend

```bash
# Restaurar el dist/ anterior de Nginx
sudo rm -rf /opt/lamicenter/frontend/dist/
sudo cp -r /opt/lamicenter/backup/frontend/dist/ /opt/lamicenter/frontend/dist/
sudo chown -R nginx:nginx /opt/lamicenter/frontend/dist/

# Nginx no requiere reinicio (sirve archivos estáticos directamente)
```

### 9.4 Checklist post-rollback

- [ ] Backend en estado `online` en PM2: `pm2 status`
- [ ] Logs sin errores: `pm2 logs lamicenter-api --lines 50`
- [ ] Frontend carga en navegador
- [ ] Login funciona
- [ ] Al menos un módulo operativo funciona correctamente
- [ ] Notificar al equipo sobre el rollback y la causa

---

## Procedimiento de backup previo al despliegue

Antes de cada despliegue, ejecutar:

```bash
# Crear directorio de backup con timestamp
FECHA=$(date +%Y%m%d_%H%M%S)
mkdir -p /opt/lamicenter/backups/$FECHA

# Backup de base de datos
pg_dump -U lamicenter_app lamicenter_produccion \
  > /opt/lamicenter/backups/$FECHA/db_backup.sql

# Backup del dist/ del backend
cp -r /opt/lamicenter/repo/backend/dist \
  /opt/lamicenter/backups/$FECHA/backend_dist

# Backup del dist/ del frontend
cp -r /opt/lamicenter/frontend/dist \
  /opt/lamicenter/backups/$FECHA/frontend_dist

# Backup del .env
cp /opt/lamicenter/repo/backend/.env \
  /opt/lamicenter/backups/$FECHA/backend_env.bak

echo "Backup completado en: /opt/lamicenter/backups/$FECHA"
```

---

## Notas adicionales

### Actualización de Node.js en el servidor

Si se necesita actualizar Node.js en el servidor, hacerlo antes de un despliegue
programado (nunca en producción activa sin ventana de mantenimiento).

### Acceso VPN

Si el acceso es por VPN, reemplazar `192.168.1.100` con la IP asignada al servidor
en el túnel VPN. Asegurarse de que la VPN está activa antes de ejecutar cualquier
validación desde un equipo externo.

### Logs del sistema

| Servicio     | Ubicación de logs                          |
|--------------|--------------------------------------------|
| Backend PM2  | `/var/log/lamicenter/pm2-out.log`          |
| Backend PM2  | `/var/log/lamicenter/pm2-error.log`        |
| Nginx access | `/var/log/nginx/lamicenter-access.log`     |
| Nginx error  | `/var/log/nginx/lamicenter-error.log`      |
| PostgreSQL   | `/var/lib/pgsql/18/data/log/`              |

### Monitoreo básico

```bash
# Ver uso de CPU y memoria del proceso Node.js
pm2 monit

# Ver últimos logs en tiempo real
pm2 logs lamicenter-api

# Estado del servidor (CPU, memoria, disco)
top
df -h
free -h
```
