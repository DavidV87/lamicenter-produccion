-- CreateEnum
CREATE TYPE "TipoEvidenciaDespacho" AS ENUM ('FOTO', 'VIDEO', 'DOCUMENTO', 'FIRMA', 'OBSERVACION');

-- CreateTable
CREATE TABLE "tipos_validacion_despacho" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(50) NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "orden_visual" INTEGER NOT NULL,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_validacion_despacho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "estado_despacho_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "despacho_por_usuario_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID,
    "fecha_despacho" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despacho_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "despacho_id" UUID NOT NULL,
    "pedido_item_id" UUID NOT NULL,
    "cantidad_despachada" DECIMAL(14,4) NOT NULL,
    "cantidad_pendiente_posterior" DECIMAL(14,4) NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despacho_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despacho_autorizaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "despacho_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID NOT NULL,
    "aprobada" BOOLEAN NOT NULL,
    "motivo_rechazo" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "despacho_autorizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_despacho" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "despacho_id" UUID NOT NULL,
    "completado" BOOLEAN NOT NULL DEFAULT false,
    "completado_por_usuario_id" UUID,
    "fecha_completado" TIMESTAMP(3),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_despacho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checklist_despacho_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "checklist_despacho_id" UUID NOT NULL,
    "tipo_validacion_despacho_id" UUID NOT NULL,
    "aprobado" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_despacho_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicacion_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "descripcion" TEXT,
    "actualizado_por_usuario_id" UUID NOT NULL,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ubicacion_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_ubicacion_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "descripcion" TEXT,
    "registrado_por_usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_ubicacion_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias_despacho" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "despacho_id" UUID NOT NULL,
    "tipo_evidencia" "TipoEvidenciaDespacho" NOT NULL,
    "ruta_archivo" VARCHAR(500),
    "nombre_original" VARCHAR(255),
    "descripcion" TEXT,
    "creado_por_usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_despacho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_validacion_despacho_codigo_key" ON "tipos_validacion_despacho"("codigo");

-- CreateIndex
CREATE INDEX "tipos_validacion_despacho_activo_idx" ON "tipos_validacion_despacho"("activo");

-- CreateIndex
CREATE INDEX "tipos_validacion_despacho_orden_visual_idx" ON "tipos_validacion_despacho"("orden_visual");

-- CreateIndex
CREATE INDEX "despachos_pedido_id_idx" ON "despachos"("pedido_id");

-- CreateIndex
CREATE INDEX "despachos_sede_id_idx" ON "despachos"("sede_id");

-- CreateIndex
CREATE INDEX "despachos_estado_despacho_id_idx" ON "despachos"("estado_despacho_id");

-- CreateIndex
CREATE INDEX "despachos_fecha_despacho_idx" ON "despachos"("fecha_despacho");

-- CreateIndex
CREATE INDEX "despacho_items_despacho_id_idx" ON "despacho_items"("despacho_id");

-- CreateIndex
CREATE INDEX "despacho_items_pedido_item_id_idx" ON "despacho_items"("pedido_item_id");

-- CreateIndex
CREATE INDEX "despacho_autorizaciones_despacho_id_idx" ON "despacho_autorizaciones"("despacho_id");

-- CreateIndex
CREATE INDEX "despacho_autorizaciones_autorizado_por_usuario_id_idx" ON "despacho_autorizaciones"("autorizado_por_usuario_id");

-- CreateIndex
CREATE INDEX "checklist_despacho_despacho_id_idx" ON "checklist_despacho"("despacho_id");

-- CreateIndex
CREATE INDEX "checklist_despacho_items_checklist_despacho_id_idx" ON "checklist_despacho_items"("checklist_despacho_id");

-- CreateIndex
CREATE INDEX "checklist_despacho_items_tipo_validacion_despacho_id_idx" ON "checklist_despacho_items"("tipo_validacion_despacho_id");

-- CreateIndex
CREATE UNIQUE INDEX "ubicacion_pedido_pedido_id_key" ON "ubicacion_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "ubicacion_pedido_sede_id_idx" ON "ubicacion_pedido"("sede_id");

-- CreateIndex
CREATE INDEX "ubicacion_pedido_ubicacion_id_idx" ON "ubicacion_pedido"("ubicacion_id");

-- CreateIndex
CREATE INDEX "historial_ubicacion_pedido_pedido_id_idx" ON "historial_ubicacion_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "historial_ubicacion_pedido_sede_id_idx" ON "historial_ubicacion_pedido"("sede_id");

-- CreateIndex
CREATE INDEX "historial_ubicacion_pedido_creado_en_idx" ON "historial_ubicacion_pedido"("creado_en");

-- CreateIndex
CREATE INDEX "evidencias_despacho_despacho_id_idx" ON "evidencias_despacho"("despacho_id");

-- CreateIndex
CREATE INDEX "evidencias_despacho_tipo_evidencia_idx" ON "evidencias_despacho"("tipo_evidencia");

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_estado_despacho_id_fkey" FOREIGN KEY ("estado_despacho_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_despacho_por_usuario_id_fkey" FOREIGN KEY ("despacho_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_autorizaciones" ADD CONSTRAINT "despacho_autorizaciones_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_autorizaciones" ADD CONSTRAINT "despacho_autorizaciones_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_despacho" ADD CONSTRAINT "checklist_despacho_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_despacho" ADD CONSTRAINT "checklist_despacho_completado_por_usuario_id_fkey" FOREIGN KEY ("completado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_despacho_items" ADD CONSTRAINT "checklist_despacho_items_checklist_despacho_id_fkey" FOREIGN KEY ("checklist_despacho_id") REFERENCES "checklist_despacho"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checklist_despacho_items" ADD CONSTRAINT "checklist_despacho_items_tipo_validacion_despacho_id_fkey" FOREIGN KEY ("tipo_validacion_despacho_id") REFERENCES "tipos_validacion_despacho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion_pedido" ADD CONSTRAINT "ubicacion_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion_pedido" ADD CONSTRAINT "ubicacion_pedido_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion_pedido" ADD CONSTRAINT "ubicacion_pedido_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicacion_pedido" ADD CONSTRAINT "ubicacion_pedido_actualizado_por_usuario_id_fkey" FOREIGN KEY ("actualizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ubicacion_pedido" ADD CONSTRAINT "historial_ubicacion_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ubicacion_pedido" ADD CONSTRAINT "historial_ubicacion_pedido_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ubicacion_pedido" ADD CONSTRAINT "historial_ubicacion_pedido_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ubicacion_pedido" ADD CONSTRAINT "historial_ubicacion_pedido_registrado_por_usuario_id_fkey" FOREIGN KEY ("registrado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_despacho" ADD CONSTRAINT "evidencias_despacho_despacho_id_fkey" FOREIGN KEY ("despacho_id") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias_despacho" ADD CONSTRAINT "evidencias_despacho_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
