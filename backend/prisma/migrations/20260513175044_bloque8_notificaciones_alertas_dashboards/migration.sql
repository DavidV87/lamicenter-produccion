-- CreateEnum
CREATE TYPE "CanalNotificacion" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'WEBHOOK', 'PUSH');

-- CreateEnum
CREATE TYPE "EstadoEnvioNotificacion" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'ENVIADO', 'FALLIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadNotificacion" AS ENUM ('ALTA', 'MEDIA', 'BAJA');

-- CreateEnum
CREATE TYPE "TipoMensajeNotificacion" AS ENUM ('INFORMACION', 'ADVERTENCIA', 'ALERTA', 'CRITICA', 'CONFIRMACION');

-- CreateTable
CREATE TABLE "notificaciones_usuario" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "destinatario_usuario_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID,
    "tipo_mensaje" "TipoMensajeNotificacion" NOT NULL,
    "prioridad" "PrioridadNotificacion" NOT NULL DEFAULT 'MEDIA',
    "titulo" VARCHAR(200) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "entidad_tipo" VARCHAR(80),
    "entidad_id" UUID,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "fecha_leida" TIMESTAMP(3),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_sistema" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "creado_por_usuario_id" UUID,
    "tipo_mensaje" "TipoMensajeNotificacion" NOT NULL,
    "prioridad" "PrioridadNotificacion" NOT NULL DEFAULT 'MEDIA',
    "titulo" VARCHAR(200) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "entidad_tipo" VARCHAR(80),
    "entidad_id" UUID,
    "metadata" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerrada_en" TIMESTAMP(3),

    CONSTRAINT "alertas_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerta_roles_destino" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "alerta_sistema_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerta_roles_destino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_notificacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "destinatario_usuario_id" UUID,
    "rol_destino_id" UUID,
    "canal" "CanalNotificacion" NOT NULL,
    "tipo_mensaje" "TipoMensajeNotificacion" NOT NULL,
    "prioridad" "PrioridadNotificacion" NOT NULL DEFAULT 'MEDIA',
    "titulo" VARCHAR(200) NOT NULL,
    "cuerpo" TEXT NOT NULL,
    "entidad_tipo" VARCHAR(80),
    "entidad_id" UUID,
    "payload" JSONB,
    "estado_envio" "EstadoEnvioNotificacion" NOT NULL DEFAULT 'PENDIENTE',
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "proximo_intento" TIMESTAMP(3),
    "mensaje_error" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesado_en" TIMESTAMP(3),

    CONSTRAINT "eventos_notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_notificacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo_evento" VARCHAR(100) NOT NULL,
    "canal" "CanalNotificacion" NOT NULL,
    "rol_destino_id" UUID,
    "usuario_destino_id" UUID,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "template_titulo" VARCHAR(200),
    "template_cuerpo" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_dashboard" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rol_id" UUID NOT NULL,
    "codigo_widget" VARCHAR(100) NOT NULL,
    "nombre_widget" VARCHAR(150) NOT NULL,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "posicion" INTEGER NOT NULL DEFAULT 0,
    "configuracion" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_metricas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rol_id" UUID NOT NULL,
    "codigo_metrica" VARCHAR(100) NOT NULL,
    "nombre_metrica" VARCHAR(150) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "configuracion" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracion_metricas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_notificaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "evento_notificacion_id" UUID NOT NULL,
    "usuario_receptor_id" UUID,
    "canal" "CanalNotificacion" NOT NULL,
    "estado_envio" "EstadoEnvioNotificacion" NOT NULL,
    "intento_numero" INTEGER NOT NULL,
    "respuesta_canal" TEXT,
    "mensaje_error" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificaciones_usuario_destinatario_usuario_id_idx" ON "notificaciones_usuario"("destinatario_usuario_id");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_leida_idx" ON "notificaciones_usuario"("leida");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_tipo_mensaje_idx" ON "notificaciones_usuario"("tipo_mensaje");

-- CreateIndex
CREATE INDEX "notificaciones_usuario_creado_en_idx" ON "notificaciones_usuario"("creado_en");

-- CreateIndex
CREATE INDEX "alertas_sistema_activa_idx" ON "alertas_sistema"("activa");

-- CreateIndex
CREATE INDEX "alertas_sistema_prioridad_idx" ON "alertas_sistema"("prioridad");

-- CreateIndex
CREATE INDEX "alertas_sistema_creado_en_idx" ON "alertas_sistema"("creado_en");

-- CreateIndex
CREATE INDEX "alerta_roles_destino_rol_id_idx" ON "alerta_roles_destino"("rol_id");

-- CreateIndex
CREATE UNIQUE INDEX "alerta_roles_destino_alerta_sistema_id_rol_id_key" ON "alerta_roles_destino"("alerta_sistema_id", "rol_id");

-- CreateIndex
CREATE INDEX "eventos_notificacion_estado_envio_idx" ON "eventos_notificacion"("estado_envio");

-- CreateIndex
CREATE INDEX "eventos_notificacion_canal_idx" ON "eventos_notificacion"("canal");

-- CreateIndex
CREATE INDEX "eventos_notificacion_proximo_intento_idx" ON "eventos_notificacion"("proximo_intento");

-- CreateIndex
CREATE INDEX "eventos_notificacion_destinatario_usuario_id_idx" ON "eventos_notificacion"("destinatario_usuario_id");

-- CreateIndex
CREATE INDEX "configuracion_notificacion_tipo_evento_idx" ON "configuracion_notificacion"("tipo_evento");

-- CreateIndex
CREATE INDEX "configuracion_notificacion_activo_idx" ON "configuracion_notificacion"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_notificacion_tipo_evento_canal_rol_destino_id_key" ON "configuracion_notificacion"("tipo_evento", "canal", "rol_destino_id", "usuario_destino_id");

-- CreateIndex
CREATE INDEX "configuracion_dashboard_rol_id_idx" ON "configuracion_dashboard"("rol_id");

-- CreateIndex
CREATE INDEX "configuracion_dashboard_visible_idx" ON "configuracion_dashboard"("visible");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_dashboard_rol_id_codigo_widget_key" ON "configuracion_dashboard"("rol_id", "codigo_widget");

-- CreateIndex
CREATE INDEX "configuracion_metricas_rol_id_idx" ON "configuracion_metricas"("rol_id");

-- CreateIndex
CREATE INDEX "configuracion_metricas_activo_idx" ON "configuracion_metricas"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_metricas_rol_id_codigo_metrica_key" ON "configuracion_metricas"("rol_id", "codigo_metrica");

-- CreateIndex
CREATE INDEX "historial_notificaciones_evento_notificacion_id_idx" ON "historial_notificaciones"("evento_notificacion_id");

-- CreateIndex
CREATE INDEX "historial_notificaciones_canal_idx" ON "historial_notificaciones"("canal");

-- CreateIndex
CREATE INDEX "historial_notificaciones_estado_envio_idx" ON "historial_notificaciones"("estado_envio");

-- AddForeignKey
ALTER TABLE "notificaciones_usuario" ADD CONSTRAINT "notificaciones_usuario_destinatario_usuario_id_fkey" FOREIGN KEY ("destinatario_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_usuario" ADD CONSTRAINT "notificaciones_usuario_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_sistema" ADD CONSTRAINT "alertas_sistema_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_roles_destino" ADD CONSTRAINT "alerta_roles_destino_alerta_sistema_id_fkey" FOREIGN KEY ("alerta_sistema_id") REFERENCES "alertas_sistema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerta_roles_destino" ADD CONSTRAINT "alerta_roles_destino_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_notificacion" ADD CONSTRAINT "eventos_notificacion_destinatario_usuario_id_fkey" FOREIGN KEY ("destinatario_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_notificacion" ADD CONSTRAINT "eventos_notificacion_rol_destino_id_fkey" FOREIGN KEY ("rol_destino_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_notificacion" ADD CONSTRAINT "configuracion_notificacion_rol_destino_id_fkey" FOREIGN KEY ("rol_destino_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_notificacion" ADD CONSTRAINT "configuracion_notificacion_usuario_destino_id_fkey" FOREIGN KEY ("usuario_destino_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_dashboard" ADD CONSTRAINT "configuracion_dashboard_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracion_metricas" ADD CONSTRAINT "configuracion_metricas_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_notificaciones" ADD CONSTRAINT "historial_notificaciones_evento_notificacion_id_fkey" FOREIGN KEY ("evento_notificacion_id") REFERENCES "eventos_notificacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_notificaciones" ADD CONSTRAINT "historial_notificaciones_usuario_receptor_id_fkey" FOREIGN KEY ("usuario_receptor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Constraint unicidad con NULLs en configuracion_notificacion
DROP INDEX IF EXISTS "configuracion_notificacion_tipo_evento_canal_rol_destino_id_usuario_destino_id_key";
CREATE UNIQUE INDEX ON configuracion_notificacion
  (tipo_evento, canal, rol_destino_id, usuario_destino_id)
  NULLS NOT DISTINCT;