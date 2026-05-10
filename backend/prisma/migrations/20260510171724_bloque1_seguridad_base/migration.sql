-- CreateEnum
CREATE TYPE "TipoAccionAuditoria" AS ENUM ('CREAR', 'ACTUALIZAR', 'CAMBIO_ESTADO', 'AUTORIZACION', 'CANCELACION', 'REPROCESO', 'DESPACHO', 'PQRS', 'OTRO');

-- CreateTable
CREATE TABLE "sedes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(255),
    "telefono" VARCHAR(30),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(80) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(150) NOT NULL,
    "email" VARCHAR(200) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "sede_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "modulo" VARCHAR(80) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "rol_id" UUID NOT NULL,
    "permiso_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_general" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tabla_afectada" VARCHAR(100) NOT NULL,
    "registro_id" UUID NOT NULL,
    "accion" "TipoAccionAuditoria" NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "metadata" JSONB,
    "usuario_id" UUID,
    "ip_origen" VARCHAR(45),
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditoria_general_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estados_sistema" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "modulo" VARCHAR(80) NOT NULL,
    "codigo" VARCHAR(80) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "es_estado_inicial" BOOLEAN NOT NULL DEFAULT false,
    "es_estado_final" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estados_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transiciones_estado" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "estado_origen_id" UUID NOT NULL,
    "estado_destino_id" UUID NOT NULL,
    "nombre" VARCHAR(150),
    "requiere_autorizacion" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transiciones_estado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transiciones_roles_autorizados" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "transicion_id" UUID NOT NULL,
    "rol_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transiciones_roles_autorizados_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sedes_nombre_key" ON "sedes"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_sede_id_idx" ON "usuarios"("sede_id");

-- CreateIndex
CREATE INDEX "usuarios_rol_id_idx" ON "usuarios"("rol_id");

-- CreateIndex
CREATE INDEX "usuarios_activo_idx" ON "usuarios"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE INDEX "permisos_modulo_idx" ON "permisos"("modulo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_permisos_rol_id_permiso_id_key" ON "roles_permisos"("rol_id", "permiso_id");

-- CreateIndex
CREATE INDEX "auditoria_general_tabla_afectada_registro_id_idx" ON "auditoria_general"("tabla_afectada", "registro_id");

-- CreateIndex
CREATE INDEX "auditoria_general_usuario_id_idx" ON "auditoria_general"("usuario_id");

-- CreateIndex
CREATE INDEX "auditoria_general_accion_idx" ON "auditoria_general"("accion");

-- CreateIndex
CREATE INDEX "auditoria_general_creado_en_idx" ON "auditoria_general"("creado_en");

-- CreateIndex
CREATE INDEX "estados_sistema_modulo_idx" ON "estados_sistema"("modulo");

-- CreateIndex
CREATE UNIQUE INDEX "estados_sistema_modulo_codigo_key" ON "estados_sistema"("modulo", "codigo");

-- CreateIndex
CREATE INDEX "transiciones_estado_estado_origen_id_idx" ON "transiciones_estado"("estado_origen_id");

-- CreateIndex
CREATE INDEX "transiciones_estado_estado_destino_id_idx" ON "transiciones_estado"("estado_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "transiciones_estado_estado_origen_id_estado_destino_id_key" ON "transiciones_estado"("estado_origen_id", "estado_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "transiciones_roles_autorizados_transicion_id_rol_id_key" ON "transiciones_roles_autorizados"("transicion_id", "rol_id");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_general" ADD CONSTRAINT "auditoria_general_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transiciones_estado" ADD CONSTRAINT "transiciones_estado_estado_origen_id_fkey" FOREIGN KEY ("estado_origen_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transiciones_estado" ADD CONSTRAINT "transiciones_estado_estado_destino_id_fkey" FOREIGN KEY ("estado_destino_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transiciones_roles_autorizados" ADD CONSTRAINT "transiciones_roles_autorizados_transicion_id_fkey" FOREIGN KEY ("transicion_id") REFERENCES "transiciones_estado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transiciones_roles_autorizados" ADD CONSTRAINT "transiciones_roles_autorizados_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
