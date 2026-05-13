-- CreateEnum
CREATE TYPE "TipoSeguimientoPqrs" AS ENUM ('CREACION', 'ASIGNACION', 'ACTUALIZACION', 'SOLUCION', 'CIERRE', 'REAPERTURA', 'ANULACION');

-- CreateEnum
CREATE TYPE "TipoEvidenciaPqrs" AS ENUM ('FOTO', 'DOCUMENTO', 'OBSERVACION');

-- CreateEnum
CREATE TYPE "RolResponsablePqrs" AS ENUM ('CREADOR', 'EJECUTOR', 'AUTORIZADOR', 'SUPERVISOR');

-- CreateTable
CREATE TABLE "pqrs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "consecutivo" VARCHAR(30) NOT NULL,
    "cliente_id" UUID NOT NULL,
    "pedido_id" UUID,
    "factura_id" UUID,
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "pedido_item_id" UUID,
    "tipo_novedad_id" UUID NOT NULL,
    "estado_pqrs_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "responsable_solucion_id" UUID,
    "cerrado_por_usuario_id" UUID,
    "fecha_cierre" TIMESTAMP(3),
    "genera_reproceso" BOOLEAN NOT NULL DEFAULT false,
    "novedad_operativa_id" UUID,
    "reproceso_id" UUID,
    "costo_estimado" DECIMAL(14,4),
    "descripcion" TEXT NOT NULL,
    "solucion_aplicada" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pqrs_seguimientos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pqrs_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "tipo_seguimiento" "TipoSeguimientoPqrs" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pqrs_seguimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pqrs_evidencias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pqrs_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "tipo_evidencia" "TipoEvidenciaPqrs" NOT NULL,
    "ruta_archivo" VARCHAR(500),
    "nombre_original" VARCHAR(255),
    "descripcion" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pqrs_evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pqrs_responsables" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pqrs_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "rol_responsable" "RolResponsablePqrs" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "fecha_fin_asignacion" TIMESTAMP(3),
    "asignado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pqrs_responsables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_pqrs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pqrs_id" UUID NOT NULL,
    "estado_anterior_id" UUID,
    "estado_nuevo_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pqrs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pqrs_consecutivo_key" ON "pqrs"("consecutivo");

-- CreateIndex
CREATE INDEX "pqrs_cliente_id_idx" ON "pqrs"("cliente_id");

-- CreateIndex
CREATE INDEX "pqrs_pedido_id_idx" ON "pqrs"("pedido_id");

-- CreateIndex
CREATE INDEX "pqrs_estado_pqrs_id_idx" ON "pqrs"("estado_pqrs_id");

-- CreateIndex
CREATE INDEX "pqrs_tipo_novedad_id_idx" ON "pqrs"("tipo_novedad_id");

-- CreateIndex
CREATE INDEX "pqrs_creado_en_idx" ON "pqrs"("creado_en");

-- CreateIndex
CREATE INDEX "pqrs_seguimientos_pqrs_id_idx" ON "pqrs_seguimientos"("pqrs_id");

-- CreateIndex
CREATE INDEX "pqrs_seguimientos_tipo_seguimiento_idx" ON "pqrs_seguimientos"("tipo_seguimiento");

-- CreateIndex
CREATE INDEX "pqrs_evidencias_pqrs_id_idx" ON "pqrs_evidencias"("pqrs_id");

-- CreateIndex
CREATE INDEX "pqrs_evidencias_tipo_evidencia_idx" ON "pqrs_evidencias"("tipo_evidencia");

-- CreateIndex
CREATE INDEX "pqrs_responsables_pqrs_id_idx" ON "pqrs_responsables"("pqrs_id");

-- CreateIndex
CREATE INDEX "pqrs_responsables_usuario_id_idx" ON "pqrs_responsables"("usuario_id");

-- CreateIndex
CREATE INDEX "pqrs_responsables_activo_idx" ON "pqrs_responsables"("activo");

-- CreateIndex
CREATE INDEX "historial_estados_pqrs_pqrs_id_idx" ON "historial_estados_pqrs"("pqrs_id");

-- CreateIndex
CREATE INDEX "historial_estados_pqrs_estado_nuevo_id_idx" ON "historial_estados_pqrs"("estado_nuevo_id");

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_tipo_novedad_id_fkey" FOREIGN KEY ("tipo_novedad_id") REFERENCES "tipos_novedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_estado_pqrs_id_fkey" FOREIGN KEY ("estado_pqrs_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_responsable_solucion_id_fkey" FOREIGN KEY ("responsable_solucion_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_cerrado_por_usuario_id_fkey" FOREIGN KEY ("cerrado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_novedad_operativa_id_fkey" FOREIGN KEY ("novedad_operativa_id") REFERENCES "novedades_operativas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs" ADD CONSTRAINT "pqrs_reproceso_id_fkey" FOREIGN KEY ("reproceso_id") REFERENCES "reprocesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_seguimientos" ADD CONSTRAINT "pqrs_seguimientos_pqrs_id_fkey" FOREIGN KEY ("pqrs_id") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_seguimientos" ADD CONSTRAINT "pqrs_seguimientos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_evidencias" ADD CONSTRAINT "pqrs_evidencias_pqrs_id_fkey" FOREIGN KEY ("pqrs_id") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_evidencias" ADD CONSTRAINT "pqrs_evidencias_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_responsables" ADD CONSTRAINT "pqrs_responsables_pqrs_id_fkey" FOREIGN KEY ("pqrs_id") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_responsables" ADD CONSTRAINT "pqrs_responsables_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pqrs_responsables" ADD CONSTRAINT "pqrs_responsables_asignado_por_usuario_id_fkey" FOREIGN KEY ("asignado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pqrs" ADD CONSTRAINT "historial_estados_pqrs_pqrs_id_fkey" FOREIGN KEY ("pqrs_id") REFERENCES "pqrs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pqrs" ADD CONSTRAINT "historial_estados_pqrs_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "estados_sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pqrs" ADD CONSTRAINT "historial_estados_pqrs_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pqrs" ADD CONSTRAINT "historial_estados_pqrs_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
