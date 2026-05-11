-- CreateEnum
CREATE TYPE "TipoEventoOperativo" AS ENUM ('INICIO_ETAPA', 'FIN_ETAPA', 'NOVEDAD', 'REPROCESO', 'CAMBIO_PRIORIDAD', 'ASIGNACION_MAQUINA', 'AUTORIZACION', 'PAUSA');

-- AlterTable
ALTER TABLE "material_cliente" ADD COLUMN     "orden_produccion_id" UUID,
ADD COLUMN     "suborden_id" UUID;

-- CreateTable
CREATE TABLE "etapas_produccion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etapas_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordenes_produccion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "sede_produccion_id" UUID NOT NULL,
    "sede_despacho_id" UUID,
    "sede_actual_id" UUID NOT NULL,
    "maquina_principal_id" UUID,
    "estado_orden_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "generada_automaticamente" BOOLEAN NOT NULL DEFAULT false,
    "orden_prioridad" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio_planeada" TIMESTAMP(3),
    "fecha_fin_planeada" TIMESTAMP(3),
    "fecha_inicio_real" TIMESTAMP(3),
    "fecha_fin_real" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordenes_produccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subordenes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "orden_produccion_id" UUID,
    "sede_produccion_id" UUID NOT NULL,
    "sede_despacho_id" UUID,
    "estado_suborden_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "generada_automaticamente" BOOLEAN NOT NULL DEFAULT false,
    "tipo_suborden" VARCHAR(150) NOT NULL,
    "orden_prioridad" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio_planeada" TIMESTAMP(3),
    "fecha_fin_planeada" TIMESTAMP(3),
    "fecha_inicio_real" TIMESTAMP(3),
    "fecha_fin_real" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subordenes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_etapas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "etapa_produccion_id" UUID NOT NULL,
    "estado_etapa_id" UUID NOT NULL,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orden_etapas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orden_asignaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_etapa_id" UUID NOT NULL,
    "maquina_id" UUID,
    "operador_id" UUID NOT NULL,
    "asignado_por_usuario_id" UUID NOT NULL,
    "fecha_inicio_asignacion" TIMESTAMP(3) NOT NULL,
    "fecha_fin_asignacion" TIMESTAMP(3),
    "motivo" VARCHAR(500),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orden_asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_operativos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "tipo_evento" "TipoEventoOperativo" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "registrado_por_id" UUID NOT NULL,
    "fecha_evento" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_operativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "novedades_operativas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo_novedad_id" UUID NOT NULL,
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "reproceso_id" UUID,
    "reportado_por_id" UUID NOT NULL,
    "descripcion" TEXT NOT NULL,
    "solucion_aplicada" TEXT,
    "fecha_novedad" TIMESTAMP(3) NOT NULL,
    "cerrada" BOOLEAN NOT NULL DEFAULT false,
    "fecha_cierre" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "novedades_operativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reprocesos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "novedad_operativa_id" UUID NOT NULL,
    "pedido_origen_id" UUID,
    "item_origen_id" UUID,
    "item_id" UUID,
    "cantidad_usada" DECIMAL(14,4),
    "motivo_reproceso" VARCHAR(500) NOT NULL,
    "solucion_aplicada" TEXT,
    "autorizado_por_usuario_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "fecha_reproceso" TIMESTAMP(3) NOT NULL,
    "costo_estimado" DECIMAL(14,4),
    "alerta_reposicion_pendiente" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reprocesos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_orden" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_produccion_id" UUID NOT NULL,
    "estado_anterior_id" UUID,
    "estado_nuevo_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_orden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_suborden" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "suborden_id" UUID NOT NULL,
    "estado_anterior_id" UUID,
    "estado_nuevo_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_suborden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calculo_perdidas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "orden_produccion_id" UUID NOT NULL,
    "material_consumido" JSONB NOT NULL,
    "piezas_producidas" INTEGER,
    "piezas_daniadas" INTEGER,
    "tiempo_invertido_minutos" INTEGER,
    "costo_estimado" DECIMAL(14,4),
    "motivo_cancelacion" VARCHAR(500) NOT NULL,
    "autorizado_por_usuario_id" UUID NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculo_perdidas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "etapas_produccion_nombre_key" ON "etapas_produccion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "etapas_produccion_codigo_key" ON "etapas_produccion"("codigo");

-- CreateIndex
CREATE INDEX "etapas_produccion_orden_idx" ON "etapas_produccion"("orden");

-- CreateIndex
CREATE INDEX "ordenes_produccion_pedido_id_idx" ON "ordenes_produccion"("pedido_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_sede_produccion_id_idx" ON "ordenes_produccion"("sede_produccion_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_sede_actual_id_idx" ON "ordenes_produccion"("sede_actual_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_estado_orden_id_idx" ON "ordenes_produccion"("estado_orden_id");

-- CreateIndex
CREATE INDEX "ordenes_produccion_orden_prioridad_idx" ON "ordenes_produccion"("orden_prioridad");

-- CreateIndex
CREATE INDEX "subordenes_pedido_id_idx" ON "subordenes"("pedido_id");

-- CreateIndex
CREATE INDEX "subordenes_orden_produccion_id_idx" ON "subordenes"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "subordenes_sede_produccion_id_idx" ON "subordenes"("sede_produccion_id");

-- CreateIndex
CREATE INDEX "subordenes_estado_suborden_id_idx" ON "subordenes"("estado_suborden_id");

-- CreateIndex
CREATE INDEX "subordenes_orden_prioridad_idx" ON "subordenes"("orden_prioridad");

-- CreateIndex
CREATE INDEX "orden_etapas_orden_produccion_id_idx" ON "orden_etapas"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "orden_etapas_suborden_id_idx" ON "orden_etapas"("suborden_id");

-- CreateIndex
CREATE INDEX "orden_etapas_etapa_produccion_id_idx" ON "orden_etapas"("etapa_produccion_id");

-- CreateIndex
CREATE INDEX "orden_etapas_estado_etapa_id_idx" ON "orden_etapas"("estado_etapa_id");

-- CreateIndex
CREATE INDEX "orden_asignaciones_orden_etapa_id_idx" ON "orden_asignaciones"("orden_etapa_id");

-- CreateIndex
CREATE INDEX "orden_asignaciones_operador_id_idx" ON "orden_asignaciones"("operador_id");

-- CreateIndex
CREATE INDEX "orden_asignaciones_orden_etapa_id_fecha_fin_asignacion_idx" ON "orden_asignaciones"("orden_etapa_id", "fecha_fin_asignacion");

-- CreateIndex
CREATE INDEX "eventos_operativos_orden_produccion_id_idx" ON "eventos_operativos"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "eventos_operativos_suborden_id_idx" ON "eventos_operativos"("suborden_id");

-- CreateIndex
CREATE INDEX "eventos_operativos_tipo_evento_idx" ON "eventos_operativos"("tipo_evento");

-- CreateIndex
CREATE INDEX "eventos_operativos_fecha_evento_idx" ON "eventos_operativos"("fecha_evento");

-- CreateIndex
CREATE UNIQUE INDEX "novedades_operativas_reproceso_id_key" ON "novedades_operativas"("reproceso_id");

-- CreateIndex
CREATE INDEX "novedades_operativas_tipo_novedad_id_idx" ON "novedades_operativas"("tipo_novedad_id");

-- CreateIndex
CREATE INDEX "novedades_operativas_orden_produccion_id_idx" ON "novedades_operativas"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "novedades_operativas_suborden_id_idx" ON "novedades_operativas"("suborden_id");

-- CreateIndex
CREATE INDEX "novedades_operativas_cerrada_idx" ON "novedades_operativas"("cerrada");

-- CreateIndex
CREATE INDEX "reprocesos_novedad_operativa_id_idx" ON "reprocesos"("novedad_operativa_id");

-- CreateIndex
CREATE INDEX "reprocesos_pedido_origen_id_idx" ON "reprocesos"("pedido_origen_id");

-- CreateIndex
CREATE INDEX "reprocesos_autorizado_por_usuario_id_idx" ON "reprocesos"("autorizado_por_usuario_id");

-- CreateIndex
CREATE INDEX "historial_estados_orden_orden_produccion_id_idx" ON "historial_estados_orden"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "historial_estados_orden_estado_nuevo_id_idx" ON "historial_estados_orden"("estado_nuevo_id");

-- CreateIndex
CREATE INDEX "historial_estados_orden_creado_en_idx" ON "historial_estados_orden"("creado_en");

-- CreateIndex
CREATE INDEX "historial_estados_suborden_suborden_id_idx" ON "historial_estados_suborden"("suborden_id");

-- CreateIndex
CREATE INDEX "historial_estados_suborden_estado_nuevo_id_idx" ON "historial_estados_suborden"("estado_nuevo_id");

-- CreateIndex
CREATE INDEX "historial_estados_suborden_creado_en_idx" ON "historial_estados_suborden"("creado_en");

-- CreateIndex
CREATE INDEX "calculo_perdidas_orden_produccion_id_idx" ON "calculo_perdidas"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "material_cliente_orden_produccion_id_idx" ON "material_cliente"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "material_cliente_suborden_id_idx" ON "material_cliente"("suborden_id");

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_sede_produccion_id_fkey" FOREIGN KEY ("sede_produccion_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_sede_despacho_id_fkey" FOREIGN KEY ("sede_despacho_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_sede_actual_id_fkey" FOREIGN KEY ("sede_actual_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_maquina_principal_id_fkey" FOREIGN KEY ("maquina_principal_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_estado_orden_id_fkey" FOREIGN KEY ("estado_orden_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordenes_produccion" ADD CONSTRAINT "ordenes_produccion_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_sede_produccion_id_fkey" FOREIGN KEY ("sede_produccion_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_sede_despacho_id_fkey" FOREIGN KEY ("sede_despacho_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_estado_suborden_id_fkey" FOREIGN KEY ("estado_suborden_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subordenes" ADD CONSTRAINT "subordenes_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_etapas" ADD CONSTRAINT "orden_etapas_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_etapas" ADD CONSTRAINT "orden_etapas_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_etapas" ADD CONSTRAINT "orden_etapas_etapa_produccion_id_fkey" FOREIGN KEY ("etapa_produccion_id") REFERENCES "etapas_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_etapas" ADD CONSTRAINT "orden_etapas_estado_etapa_id_fkey" FOREIGN KEY ("estado_etapa_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_asignaciones" ADD CONSTRAINT "orden_asignaciones_orden_etapa_id_fkey" FOREIGN KEY ("orden_etapa_id") REFERENCES "orden_etapas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_asignaciones" ADD CONSTRAINT "orden_asignaciones_maquina_id_fkey" FOREIGN KEY ("maquina_id") REFERENCES "maquinas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_asignaciones" ADD CONSTRAINT "orden_asignaciones_operador_id_fkey" FOREIGN KEY ("operador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orden_asignaciones" ADD CONSTRAINT "orden_asignaciones_asignado_por_usuario_id_fkey" FOREIGN KEY ("asignado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_operativos" ADD CONSTRAINT "eventos_operativos_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_operativos" ADD CONSTRAINT "eventos_operativos_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_operativos" ADD CONSTRAINT "eventos_operativos_registrado_por_id_fkey" FOREIGN KEY ("registrado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_operativas" ADD CONSTRAINT "novedades_operativas_tipo_novedad_id_fkey" FOREIGN KEY ("tipo_novedad_id") REFERENCES "tipos_novedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_operativas" ADD CONSTRAINT "novedades_operativas_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_operativas" ADD CONSTRAINT "novedades_operativas_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_operativas" ADD CONSTRAINT "novedades_operativas_reproceso_id_fkey" FOREIGN KEY ("reproceso_id") REFERENCES "reprocesos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "novedades_operativas" ADD CONSTRAINT "novedades_operativas_reportado_por_id_fkey" FOREIGN KEY ("reportado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_novedad_operativa_id_fkey" FOREIGN KEY ("novedad_operativa_id") REFERENCES "novedades_operativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_pedido_origen_id_fkey" FOREIGN KEY ("pedido_origen_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_item_origen_id_fkey" FOREIGN KEY ("item_origen_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reprocesos" ADD CONSTRAINT "reprocesos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "estados_sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_orden" ADD CONSTRAINT "historial_estados_orden_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_suborden" ADD CONSTRAINT "historial_estados_suborden_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_suborden" ADD CONSTRAINT "historial_estados_suborden_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "estados_sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_suborden" ADD CONSTRAINT "historial_estados_suborden_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_suborden" ADD CONSTRAINT "historial_estados_suborden_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_perdidas" ADD CONSTRAINT "calculo_perdidas_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculo_perdidas" ADD CONSTRAINT "calculo_perdidas_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
