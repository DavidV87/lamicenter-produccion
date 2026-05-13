-- CreateEnum
CREATE TYPE "TipoRequerimiento" AS ENUM ('PRODUCCION', 'COMPRA', 'TRASLADO', 'RESERVA', 'GENERAL');

-- CreateEnum
CREATE TYPE "TipoMovimientoMaterial" AS ENUM ('ENTRADA_COMPRA', 'ENTRADA_TRASLADO', 'ENTRADA_AJUSTE', 'SALIDA_PRODUCCION', 'SALIDA_TRASLADO', 'SALIDA_AJUSTE', 'RESERVA', 'LIBERACION_RESERVA', 'DEVOLUCION_PROVEEDOR');

-- CreateEnum
CREATE TYPE "TipoAlertaAbastecimiento" AS ENUM ('STOCK_MINIMO', 'STOCK_CRITICO', 'RETRASO_ENTREGA', 'SIN_PROVEEDOR', 'COMPRA_PENDIENTE', 'RESERVA_INSUFICIENTE');

-- CreateEnum
CREATE TYPE "EstadoReservaMaterial" AS ENUM ('ACTIVA', 'LIBERADA', 'CONSUMIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "requerimientos_material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "pedido_id" UUID,
    "tipo_requerimiento" "TipoRequerimiento" NOT NULL,
    "estado_requerimiento_id" UUID NOT NULL,
    "fecha_requerida" DATE,
    "cantidad_requerida" DECIMAL(14,4) NOT NULL,
    "cantidad_aprobada" DECIMAL(14,4),
    "cantidad_atendida" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "creado_por_usuario_id" UUID NOT NULL,
    "atendido_por_usuario_id" UUID,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requerimientos_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_compra" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(50) NOT NULL,
    "sede_id" UUID NOT NULL,
    "proveedor_id" UUID,
    "estado_solicitud_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID,
    "fecha_solicitud" DATE NOT NULL,
    "fecha_requerida" DATE,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitudes_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitud_compra_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "solicitud_compra_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "requerimiento_material_id" UUID,
    "cantidad_solicitada" DECIMAL(14,4) NOT NULL,
    "precio_estimado" DECIMAL(14,4),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitud_compra_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compras_material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "solicitud_compra_id" UUID,
    "sede_id" UUID NOT NULL,
    "proveedor_id" UUID NOT NULL,
    "estado_compra_id" UUID NOT NULL,
    "numero_orden_compra" VARCHAR(80),
    "creado_por_usuario_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID,
    "fecha_compra" DATE NOT NULL,
    "fecha_entrega_estimada" DATE,
    "valor_total" DECIMAL(16,4),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compras_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compra_material_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "compra_material_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "solicitud_item_id" UUID,
    "cantidad_solicitada" DECIMAL(14,4) NOT NULL,
    "cantidad_recibida" DECIMAL(14,4),
    "precio_unitario" DECIMAL(14,4),
    "subtotal" DECIMAL(16,4),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compra_material_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepciones_material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "compra_material_id" UUID,
    "traslado_material_id" UUID,
    "sede_id" UUID NOT NULL,
    "estado_recepcion_id" UUID NOT NULL,
    "recibido_por_usuario_id" UUID NOT NULL,
    "fecha_recepcion" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recepciones_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recepcion_material_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recepcion_material_id" UUID NOT NULL,
    "compra_item_id" UUID,
    "traslado_item_id" UUID,
    "item_id" UUID NOT NULL,
    "cantidad_recibida" DECIMAL(14,4) NOT NULL,
    "ubicacion_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recepcion_material_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traslados_material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "codigo" VARCHAR(50) NOT NULL,
    "sede_origen_id" UUID NOT NULL,
    "sede_destino_id" UUID NOT NULL,
    "estado_traslado_id" UUID NOT NULL,
    "solicitado_por_usuario_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID,
    "fecha_solicitud" DATE NOT NULL,
    "fecha_envio" TIMESTAMP(3),
    "fecha_recepcion" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traslados_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traslado_material_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "traslado_material_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "cantidad_solicitada" DECIMAL(14,4) NOT NULL,
    "cantidad_enviada" DECIMAL(14,4),
    "cantidad_recibida" DECIMAL(14,4),
    "ubicacion_origen_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "traslado_material_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_material" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "tipo_movimiento" "TipoMovimientoMaterial" NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "saldo_resultante" DECIMAL(14,4) NOT NULL,
    "traslado_material_id" UUID,
    "compra_material_id" UUID,
    "recepcion_material_id" UUID,
    "requerimiento_material_id" UUID,
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "pedido_id" UUID,
    "creado_por_usuario_id" UUID,
    "descripcion" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientos_material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_reservado" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "pedido_id" UUID,
    "orden_produccion_id" UUID,
    "suborden_id" UUID,
    "cantidad_reservada" DECIMAL(14,4) NOT NULL,
    "estado_reserva" "EstadoReservaMaterial" NOT NULL DEFAULT 'ACTIVA',
    "creado_por_usuario_id" UUID NOT NULL,
    "fecha_reserva" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_reservado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "abastecimiento_alertas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo_alerta" "TipoAlertaAbastecimiento" NOT NULL,
    "item_id" UUID,
    "sede_id" UUID,
    "descripcion" TEXT NOT NULL,
    "abierta" BOOLEAN NOT NULL DEFAULT true,
    "motivo_cierre" TEXT,
    "creado_por_usuario_id" UUID,
    "cerrada_por_usuario_id" UUID,
    "fecha_cierre" TIMESTAMP(3),
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abastecimiento_alertas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventario_operativo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "item_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "ubicacion_id" UUID,
    "cantidad_disponible" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "cantidad_reservada" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "cantidad_en_produccion" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "cantidad_en_transito" DECIMAL(14,4) NOT NULL DEFAULT 0,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_operativo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requerimientos_material_item_id_idx" ON "requerimientos_material"("item_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_sede_id_idx" ON "requerimientos_material"("sede_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_orden_produccion_id_idx" ON "requerimientos_material"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_suborden_id_idx" ON "requerimientos_material"("suborden_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_pedido_id_idx" ON "requerimientos_material"("pedido_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_estado_requerimiento_id_idx" ON "requerimientos_material"("estado_requerimiento_id");

-- CreateIndex
CREATE INDEX "requerimientos_material_tipo_requerimiento_idx" ON "requerimientos_material"("tipo_requerimiento");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_compra_codigo_key" ON "solicitudes_compra"("codigo");

-- CreateIndex
CREATE INDEX "solicitudes_compra_sede_id_idx" ON "solicitudes_compra"("sede_id");

-- CreateIndex
CREATE INDEX "solicitudes_compra_proveedor_id_idx" ON "solicitudes_compra"("proveedor_id");

-- CreateIndex
CREATE INDEX "solicitudes_compra_estado_solicitud_id_idx" ON "solicitudes_compra"("estado_solicitud_id");

-- CreateIndex
CREATE INDEX "solicitudes_compra_fecha_solicitud_idx" ON "solicitudes_compra"("fecha_solicitud");

-- CreateIndex
CREATE INDEX "solicitud_compra_items_solicitud_compra_id_idx" ON "solicitud_compra_items"("solicitud_compra_id");

-- CreateIndex
CREATE INDEX "solicitud_compra_items_item_id_idx" ON "solicitud_compra_items"("item_id");

-- CreateIndex
CREATE INDEX "solicitud_compra_items_requerimiento_material_id_idx" ON "solicitud_compra_items"("requerimiento_material_id");

-- CreateIndex
CREATE UNIQUE INDEX "compras_material_numero_orden_compra_key" ON "compras_material"("numero_orden_compra");

-- CreateIndex
CREATE INDEX "compras_material_solicitud_compra_id_idx" ON "compras_material"("solicitud_compra_id");

-- CreateIndex
CREATE INDEX "compras_material_sede_id_idx" ON "compras_material"("sede_id");

-- CreateIndex
CREATE INDEX "compras_material_proveedor_id_idx" ON "compras_material"("proveedor_id");

-- CreateIndex
CREATE INDEX "compras_material_estado_compra_id_idx" ON "compras_material"("estado_compra_id");

-- CreateIndex
CREATE INDEX "compras_material_fecha_compra_idx" ON "compras_material"("fecha_compra");

-- CreateIndex
CREATE INDEX "compra_material_items_compra_material_id_idx" ON "compra_material_items"("compra_material_id");

-- CreateIndex
CREATE INDEX "compra_material_items_item_id_idx" ON "compra_material_items"("item_id");

-- CreateIndex
CREATE INDEX "compra_material_items_solicitud_item_id_idx" ON "compra_material_items"("solicitud_item_id");

-- CreateIndex
CREATE INDEX "recepciones_material_compra_material_id_idx" ON "recepciones_material"("compra_material_id");

-- CreateIndex
CREATE INDEX "recepciones_material_traslado_material_id_idx" ON "recepciones_material"("traslado_material_id");

-- CreateIndex
CREATE INDEX "recepciones_material_sede_id_idx" ON "recepciones_material"("sede_id");

-- CreateIndex
CREATE INDEX "recepciones_material_estado_recepcion_id_idx" ON "recepciones_material"("estado_recepcion_id");

-- CreateIndex
CREATE INDEX "recepciones_material_fecha_recepcion_idx" ON "recepciones_material"("fecha_recepcion");

-- CreateIndex
CREATE INDEX "recepcion_material_items_recepcion_material_id_idx" ON "recepcion_material_items"("recepcion_material_id");

-- CreateIndex
CREATE INDEX "recepcion_material_items_item_id_idx" ON "recepcion_material_items"("item_id");

-- CreateIndex
CREATE INDEX "recepcion_material_items_compra_item_id_idx" ON "recepcion_material_items"("compra_item_id");

-- CreateIndex
CREATE INDEX "recepcion_material_items_traslado_item_id_idx" ON "recepcion_material_items"("traslado_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "traslados_material_codigo_key" ON "traslados_material"("codigo");

-- CreateIndex
CREATE INDEX "traslados_material_sede_origen_id_idx" ON "traslados_material"("sede_origen_id");

-- CreateIndex
CREATE INDEX "traslados_material_sede_destino_id_idx" ON "traslados_material"("sede_destino_id");

-- CreateIndex
CREATE INDEX "traslados_material_estado_traslado_id_idx" ON "traslados_material"("estado_traslado_id");

-- CreateIndex
CREATE INDEX "traslados_material_fecha_solicitud_idx" ON "traslados_material"("fecha_solicitud");

-- CreateIndex
CREATE INDEX "traslado_material_items_traslado_material_id_idx" ON "traslado_material_items"("traslado_material_id");

-- CreateIndex
CREATE INDEX "traslado_material_items_item_id_idx" ON "traslado_material_items"("item_id");

-- CreateIndex
CREATE INDEX "movimientos_material_item_id_idx" ON "movimientos_material"("item_id");

-- CreateIndex
CREATE INDEX "movimientos_material_sede_id_idx" ON "movimientos_material"("sede_id");

-- CreateIndex
CREATE INDEX "movimientos_material_tipo_movimiento_idx" ON "movimientos_material"("tipo_movimiento");

-- CreateIndex
CREATE INDEX "movimientos_material_creado_en_idx" ON "movimientos_material"("creado_en");

-- CreateIndex
CREATE INDEX "movimientos_material_traslado_material_id_idx" ON "movimientos_material"("traslado_material_id");

-- CreateIndex
CREATE INDEX "movimientos_material_compra_material_id_idx" ON "movimientos_material"("compra_material_id");

-- CreateIndex
CREATE INDEX "movimientos_material_recepcion_material_id_idx" ON "movimientos_material"("recepcion_material_id");

-- CreateIndex
CREATE INDEX "movimientos_material_orden_produccion_id_idx" ON "movimientos_material"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "material_reservado_item_id_idx" ON "material_reservado"("item_id");

-- CreateIndex
CREATE INDEX "material_reservado_sede_id_idx" ON "material_reservado"("sede_id");

-- CreateIndex
CREATE INDEX "material_reservado_pedido_id_idx" ON "material_reservado"("pedido_id");

-- CreateIndex
CREATE INDEX "material_reservado_orden_produccion_id_idx" ON "material_reservado"("orden_produccion_id");

-- CreateIndex
CREATE INDEX "material_reservado_suborden_id_idx" ON "material_reservado"("suborden_id");

-- CreateIndex
CREATE INDEX "material_reservado_estado_reserva_idx" ON "material_reservado"("estado_reserva");

-- CreateIndex
CREATE INDEX "abastecimiento_alertas_tipo_alerta_idx" ON "abastecimiento_alertas"("tipo_alerta");

-- CreateIndex
CREATE INDEX "abastecimiento_alertas_item_id_idx" ON "abastecimiento_alertas"("item_id");

-- CreateIndex
CREATE INDEX "abastecimiento_alertas_sede_id_idx" ON "abastecimiento_alertas"("sede_id");

-- CreateIndex
CREATE INDEX "abastecimiento_alertas_abierta_idx" ON "abastecimiento_alertas"("abierta");

-- CreateIndex
CREATE INDEX "inventario_operativo_item_id_idx" ON "inventario_operativo"("item_id");

-- CreateIndex
CREATE INDEX "inventario_operativo_sede_id_idx" ON "inventario_operativo"("sede_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_operativo_item_id_sede_id_ubicacion_id_key" ON "inventario_operativo"("item_id", "sede_id", "ubicacion_id");

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_estado_requerimiento_id_fkey" FOREIGN KEY ("estado_requerimiento_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requerimientos_material" ADD CONSTRAINT "requerimientos_material_atendido_por_usuario_id_fkey" FOREIGN KEY ("atendido_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_compra" ADD CONSTRAINT "solicitudes_compra_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_compra" ADD CONSTRAINT "solicitudes_compra_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_compra" ADD CONSTRAINT "solicitudes_compra_estado_solicitud_id_fkey" FOREIGN KEY ("estado_solicitud_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_compra" ADD CONSTRAINT "solicitudes_compra_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_compra" ADD CONSTRAINT "solicitudes_compra_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_compra_items" ADD CONSTRAINT "solicitud_compra_items_solicitud_compra_id_fkey" FOREIGN KEY ("solicitud_compra_id") REFERENCES "solicitudes_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_compra_items" ADD CONSTRAINT "solicitud_compra_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitud_compra_items" ADD CONSTRAINT "solicitud_compra_items_requerimiento_material_id_fkey" FOREIGN KEY ("requerimiento_material_id") REFERENCES "requerimientos_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_solicitud_compra_id_fkey" FOREIGN KEY ("solicitud_compra_id") REFERENCES "solicitudes_compra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_estado_compra_id_fkey" FOREIGN KEY ("estado_compra_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compras_material" ADD CONSTRAINT "compras_material_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_material_items" ADD CONSTRAINT "compra_material_items_compra_material_id_fkey" FOREIGN KEY ("compra_material_id") REFERENCES "compras_material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_material_items" ADD CONSTRAINT "compra_material_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compra_material_items" ADD CONSTRAINT "compra_material_items_solicitud_item_id_fkey" FOREIGN KEY ("solicitud_item_id") REFERENCES "solicitud_compra_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_material" ADD CONSTRAINT "recepciones_material_compra_material_id_fkey" FOREIGN KEY ("compra_material_id") REFERENCES "compras_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_material" ADD CONSTRAINT "recepciones_material_traslado_material_id_fkey" FOREIGN KEY ("traslado_material_id") REFERENCES "traslados_material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_material" ADD CONSTRAINT "recepciones_material_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_material" ADD CONSTRAINT "recepciones_material_estado_recepcion_id_fkey" FOREIGN KEY ("estado_recepcion_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepciones_material" ADD CONSTRAINT "recepciones_material_recibido_por_usuario_id_fkey" FOREIGN KEY ("recibido_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_material_items" ADD CONSTRAINT "recepcion_material_items_recepcion_material_id_fkey" FOREIGN KEY ("recepcion_material_id") REFERENCES "recepciones_material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_material_items" ADD CONSTRAINT "recepcion_material_items_compra_item_id_fkey" FOREIGN KEY ("compra_item_id") REFERENCES "compra_material_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_material_items" ADD CONSTRAINT "recepcion_material_items_traslado_item_id_fkey" FOREIGN KEY ("traslado_item_id") REFERENCES "traslado_material_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_material_items" ADD CONSTRAINT "recepcion_material_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recepcion_material_items" ADD CONSTRAINT "recepcion_material_items_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados_material" ADD CONSTRAINT "traslados_material_sede_origen_id_fkey" FOREIGN KEY ("sede_origen_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados_material" ADD CONSTRAINT "traslados_material_sede_destino_id_fkey" FOREIGN KEY ("sede_destino_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados_material" ADD CONSTRAINT "traslados_material_estado_traslado_id_fkey" FOREIGN KEY ("estado_traslado_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados_material" ADD CONSTRAINT "traslados_material_solicitado_por_usuario_id_fkey" FOREIGN KEY ("solicitado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslados_material" ADD CONSTRAINT "traslados_material_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslado_material_items" ADD CONSTRAINT "traslado_material_items_traslado_material_id_fkey" FOREIGN KEY ("traslado_material_id") REFERENCES "traslados_material"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslado_material_items" ADD CONSTRAINT "traslado_material_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traslado_material_items" ADD CONSTRAINT "traslado_material_items_ubicacion_origen_id_fkey" FOREIGN KEY ("ubicacion_origen_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_traslado_material_id_fkey" FOREIGN KEY ("traslado_material_id") REFERENCES "traslados_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_compra_material_id_fkey" FOREIGN KEY ("compra_material_id") REFERENCES "compras_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_recepcion_material_id_fkey" FOREIGN KEY ("recepcion_material_id") REFERENCES "recepciones_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_requerimiento_material_id_fkey" FOREIGN KEY ("requerimiento_material_id") REFERENCES "requerimientos_material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_material" ADD CONSTRAINT "movimientos_material_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_orden_produccion_id_fkey" FOREIGN KEY ("orden_produccion_id") REFERENCES "ordenes_produccion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_suborden_id_fkey" FOREIGN KEY ("suborden_id") REFERENCES "subordenes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_reservado" ADD CONSTRAINT "material_reservado_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimiento_alertas" ADD CONSTRAINT "abastecimiento_alertas_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimiento_alertas" ADD CONSTRAINT "abastecimiento_alertas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimiento_alertas" ADD CONSTRAINT "abastecimiento_alertas_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "abastecimiento_alertas" ADD CONSTRAINT "abastecimiento_alertas_cerrada_por_usuario_id_fkey" FOREIGN KEY ("cerrada_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_operativo" ADD CONSTRAINT "inventario_operativo_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_operativo" ADD CONSTRAINT "inventario_operativo_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario_operativo" ADD CONSTRAINT "inventario_operativo_ubicacion_id_fkey" FOREIGN KEY ("ubicacion_id") REFERENCES "ubicaciones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Constraint 1: unicidad de inventario con NULL en ubicacion_id
DROP INDEX IF EXISTS "inventario_operativo_item_id_sede_id_ubicacion_id_key";
CREATE UNIQUE INDEX "inventario_operativo_item_id_sede_id_ubicacion_id_key"
ON inventario_operativo (item_id, sede_id, ubicacion_id) NULLS NOT DISTINCT;

-- Constraint 2: recepcion debe tener compra O traslado origen
ALTER TABLE recepciones_material
ADD CONSTRAINT chk_recepcion_origen
CHECK (compra_material_id IS NOT NULL OR traslado_material_id IS NOT NULL);