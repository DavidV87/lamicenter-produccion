-- CreateEnum
CREATE TYPE "DestinoOperativo" AS ENUM ('PRODUCCION', 'DESPACHO_DIRECTO', 'MATERIAL_CLIENTE', 'SERVICIO');

-- CreateEnum
CREATE TYPE "TipoMaterialCliente" AS ENUM ('TABLERO', 'TAPA', 'RETAL', 'HERRAJE', 'INSUMO');

-- CreateEnum
CREATE TYPE "EstadoMaterialCliente" AS ENUM ('PENDIENTE_RECEPCION', 'RECIBIDO', 'EN_PROCESO', 'DEVUELTO', 'EXTRAVIADO');

-- CreateEnum
CREATE TYPE "EstadoValidacionPedido" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA', 'REQUIERE_AJUSTE');

-- CreateEnum
CREATE TYPE "TipoMovimientoSede" AS ENUM ('TRASLADO_PRODUCCION', 'TRASLADO_DESPACHO', 'DEVOLUCION_SEDE_ORIGEN', 'ASIGNACION_INICIAL', 'CAMBIO_RESPONSABLE');

-- CreateEnum
CREATE TYPE "TipoRelacionFacturaPedido" AS ENUM ('PRINCIPAL', 'ADICIONAL', 'REEMPLAZO', 'DEVOLUCION', 'COMPLEMENTO');

-- CreateEnum
CREATE TYPE "TipoBloqueo" AS ENUM ('FACTURA_ANULADA', 'PAGO_VENCIDO', 'REVISION_ADMINISTRATIVA', 'PENDIENTE_AUTORIZACION', 'MANUAL');

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sede_venta_id" UUID NOT NULL,
    "sede_responsable_id" UUID NOT NULL,
    "sede_despacho_id" UUID,
    "cliente_id" UUID NOT NULL,
    "vendedor_id" UUID,
    "creado_por_usuario_id" UUID NOT NULL,
    "estado_pedido_id" UUID NOT NULL,
    "observaciones" TEXT,
    "fecha_listo_despacho" TIMESTAMP(3),
    "fecha_despacho_completo" TIMESTAMP(3),
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "item_id" UUID,
    "factura_item_id" UUID,
    "descripcion" VARCHAR(500) NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "cantidad_total" DECIMAL(14,4) NOT NULL,
    "cantidad_para_produccion" DECIMAL(14,4) NOT NULL,
    "cantidad_para_despacho_entero" DECIMAL(14,4) NOT NULL,
    "cantidad_pendiente" DECIMAL(14,4) NOT NULL,
    "precio_unitario" DECIMAL(14,4),
    "destino_operativo" "DestinoOperativo" NOT NULL,
    "es_material_cliente" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_item_documentos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_item_id" UUID NOT NULL,
    "documento_id" UUID NOT NULL,
    "tipo_uso" VARCHAR(80),
    "creado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_item_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "pedido_item_id" UUID,
    "tipo_material" "TipoMaterialCliente" NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "cantidad" DECIMAL(14,4) NOT NULL,
    "medidas_aproximadas" VARCHAR(150),
    "estado_fisico_recibido" VARCHAR(255),
    "estado" "EstadoMaterialCliente" NOT NULL DEFAULT 'PENDIENTE_RECEPCION',
    "recibido_por_usuario_id" UUID,
    "fecha_recepcion" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_por_usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validaciones_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "validado_por_usuario_id" UUID,
    "estado_validacion" "EstadoValidacionPedido" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validaciones_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validacion_pedido_detalles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "validacion_pedido_id" UUID NOT NULL,
    "tipo_verificacion" VARCHAR(150) NOT NULL,
    "aprobado" BOOLEAN NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "validacion_pedido_detalles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "contacto_cliente_id" UUID,
    "entregado_por_usuario_id" UUID NOT NULL,
    "recibe_nombre" VARCHAR(200),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entrega_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entrega_id" UUID NOT NULL,
    "pedido_item_id" UUID NOT NULL,
    "cantidad_entregada" DECIMAL(14,4) NOT NULL,
    "cantidad_pendiente_posterior" DECIMAL(14,4) NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entrega_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estados_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "estado_anterior_id" UUID,
    "estado_nuevo_id" UUID NOT NULL,
    "creado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_estados_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "vendedor_id" UUID NOT NULL,
    "asignado_por_usuario_id" UUID NOT NULL,
    "fecha_inicio_asignacion" TIMESTAMP(3) NOT NULL,
    "fecha_fin_asignacion" TIMESTAMP(3),
    "motivo" VARCHAR(500),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bloqueos_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "tipo_bloqueo" "TipoBloqueo" NOT NULL,
    "motivo_bloqueo" VARCHAR(500) NOT NULL,
    "bloqueado_por_usuario_id" UUID,
    "desbloqueado_por_usuario_id" UUID,
    "fecha_bloqueo" TIMESTAMP(3) NOT NULL,
    "fecha_desbloqueo" TIMESTAMP(3),
    "observaciones" TEXT,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bloqueos_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_sedes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "sede_origen_id" UUID NOT NULL,
    "sede_destino_id" UUID NOT NULL,
    "tipo_movimiento_sede" "TipoMovimientoSede" NOT NULL,
    "solicitado_por_usuario_id" UUID NOT NULL,
    "autorizado_por_usuario_id" UUID,
    "fecha_movimiento" TIMESTAMP(3) NOT NULL,
    "observaciones" TEXT NOT NULL,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "factura_id" UUID NOT NULL,
    "pedido_id" UUID NOT NULL,
    "tipo_relacion" "TipoRelacionFacturaPedido" NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_relacion" TIMESTAMP(3) NOT NULL,
    "relacionado_por_usuario_id" UUID NOT NULL,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factura_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pedidos_sede_venta_id_idx" ON "pedidos"("sede_venta_id");

-- CreateIndex
CREATE INDEX "pedidos_sede_responsable_id_idx" ON "pedidos"("sede_responsable_id");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_idx" ON "pedidos"("cliente_id");

-- CreateIndex
CREATE INDEX "pedidos_vendedor_id_idx" ON "pedidos"("vendedor_id");

-- CreateIndex
CREATE INDEX "pedidos_estado_pedido_id_idx" ON "pedidos"("estado_pedido_id");

-- CreateIndex
CREATE INDEX "pedido_items_pedido_id_idx" ON "pedido_items"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_items_item_id_idx" ON "pedido_items"("item_id");

-- CreateIndex
CREATE INDEX "pedido_items_factura_item_id_idx" ON "pedido_items"("factura_item_id");

-- CreateIndex
CREATE INDEX "pedido_items_destino_operativo_idx" ON "pedido_items"("destino_operativo");

-- CreateIndex
CREATE INDEX "pedido_item_documentos_pedido_item_id_idx" ON "pedido_item_documentos"("pedido_item_id");

-- CreateIndex
CREATE INDEX "pedido_item_documentos_documento_id_idx" ON "pedido_item_documentos"("documento_id");

-- CreateIndex
CREATE INDEX "material_cliente_pedido_id_idx" ON "material_cliente"("pedido_id");

-- CreateIndex
CREATE INDEX "material_cliente_pedido_item_id_idx" ON "material_cliente"("pedido_item_id");

-- CreateIndex
CREATE INDEX "material_cliente_estado_idx" ON "material_cliente"("estado");

-- CreateIndex
CREATE INDEX "validaciones_pedido_pedido_id_idx" ON "validaciones_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "validaciones_pedido_estado_validacion_idx" ON "validaciones_pedido"("estado_validacion");

-- CreateIndex
CREATE INDEX "validacion_pedido_detalles_validacion_pedido_id_idx" ON "validacion_pedido_detalles"("validacion_pedido_id");

-- CreateIndex
CREATE INDEX "entregas_pedido_id_idx" ON "entregas"("pedido_id");

-- CreateIndex
CREATE INDEX "entregas_contacto_cliente_id_idx" ON "entregas"("contacto_cliente_id");

-- CreateIndex
CREATE INDEX "entrega_items_entrega_id_idx" ON "entrega_items"("entrega_id");

-- CreateIndex
CREATE INDEX "entrega_items_pedido_item_id_idx" ON "entrega_items"("pedido_item_id");

-- CreateIndex
CREATE INDEX "historial_estados_pedido_pedido_id_idx" ON "historial_estados_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "historial_estados_pedido_estado_nuevo_id_idx" ON "historial_estados_pedido"("estado_nuevo_id");

-- CreateIndex
CREATE INDEX "historial_estados_pedido_creado_en_idx" ON "historial_estados_pedido"("creado_en");

-- CreateIndex
CREATE INDEX "asignaciones_pedido_pedido_id_idx" ON "asignaciones_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "asignaciones_pedido_vendedor_id_idx" ON "asignaciones_pedido"("vendedor_id");

-- CreateIndex
CREATE INDEX "asignaciones_pedido_pedido_id_fecha_fin_asignacion_idx" ON "asignaciones_pedido"("pedido_id", "fecha_fin_asignacion");

-- CreateIndex
CREATE INDEX "bloqueos_pedido_pedido_id_idx" ON "bloqueos_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "bloqueos_pedido_tipo_bloqueo_idx" ON "bloqueos_pedido"("tipo_bloqueo");

-- CreateIndex
CREATE INDEX "bloqueos_pedido_fecha_desbloqueo_idx" ON "bloqueos_pedido"("fecha_desbloqueo");

-- CreateIndex
CREATE INDEX "pedido_sedes_pedido_id_idx" ON "pedido_sedes"("pedido_id");

-- CreateIndex
CREATE INDEX "pedido_sedes_sede_origen_id_idx" ON "pedido_sedes"("sede_origen_id");

-- CreateIndex
CREATE INDEX "pedido_sedes_sede_destino_id_idx" ON "pedido_sedes"("sede_destino_id");

-- CreateIndex
CREATE INDEX "factura_pedido_factura_id_idx" ON "factura_pedido"("factura_id");

-- CreateIndex
CREATE INDEX "factura_pedido_pedido_id_idx" ON "factura_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "factura_pedido_es_principal_idx" ON "factura_pedido"("es_principal");

-- CreateIndex
CREATE UNIQUE INDEX "factura_pedido_factura_id_pedido_id_tipo_relacion_key" ON "factura_pedido"("factura_id", "pedido_id", "tipo_relacion");

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_sede_venta_id_fkey" FOREIGN KEY ("sede_venta_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_sede_responsable_id_fkey" FOREIGN KEY ("sede_responsable_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_sede_despacho_id_fkey" FOREIGN KEY ("sede_despacho_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_estado_pedido_id_fkey" FOREIGN KEY ("estado_pedido_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_factura_item_id_fkey" FOREIGN KEY ("factura_item_id") REFERENCES "factura_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_documentos" ADD CONSTRAINT "pedido_item_documentos_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_documentos" ADD CONSTRAINT "pedido_item_documentos_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_item_documentos" ADD CONSTRAINT "pedido_item_documentos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_recibido_por_usuario_id_fkey" FOREIGN KEY ("recibido_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_cliente" ADD CONSTRAINT "material_cliente_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validaciones_pedido" ADD CONSTRAINT "validaciones_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validaciones_pedido" ADD CONSTRAINT "validaciones_pedido_validado_por_usuario_id_fkey" FOREIGN KEY ("validado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validacion_pedido_detalles" ADD CONSTRAINT "validacion_pedido_detalles_validacion_pedido_id_fkey" FOREIGN KEY ("validacion_pedido_id") REFERENCES "validaciones_pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_contacto_cliente_id_fkey" FOREIGN KEY ("contacto_cliente_id") REFERENCES "contactos_cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_entregado_por_usuario_id_fkey" FOREIGN KEY ("entregado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_items" ADD CONSTRAINT "entrega_items_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "entregas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_items" ADD CONSTRAINT "entrega_items_pedido_item_id_fkey" FOREIGN KEY ("pedido_item_id") REFERENCES "pedido_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pedido" ADD CONSTRAINT "historial_estados_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pedido" ADD CONSTRAINT "historial_estados_pedido_estado_anterior_id_fkey" FOREIGN KEY ("estado_anterior_id") REFERENCES "estados_sistema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pedido" ADD CONSTRAINT "historial_estados_pedido_estado_nuevo_id_fkey" FOREIGN KEY ("estado_nuevo_id") REFERENCES "estados_sistema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estados_pedido" ADD CONSTRAINT "historial_estados_pedido_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_pedido" ADD CONSTRAINT "asignaciones_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_pedido" ADD CONSTRAINT "asignaciones_pedido_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones_pedido" ADD CONSTRAINT "asignaciones_pedido_asignado_por_usuario_id_fkey" FOREIGN KEY ("asignado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_pedido" ADD CONSTRAINT "bloqueos_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_pedido" ADD CONSTRAINT "bloqueos_pedido_bloqueado_por_usuario_id_fkey" FOREIGN KEY ("bloqueado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bloqueos_pedido" ADD CONSTRAINT "bloqueos_pedido_desbloqueado_por_usuario_id_fkey" FOREIGN KEY ("desbloqueado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sedes" ADD CONSTRAINT "pedido_sedes_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sedes" ADD CONSTRAINT "pedido_sedes_sede_origen_id_fkey" FOREIGN KEY ("sede_origen_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sedes" ADD CONSTRAINT "pedido_sedes_sede_destino_id_fkey" FOREIGN KEY ("sede_destino_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sedes" ADD CONSTRAINT "pedido_sedes_solicitado_por_usuario_id_fkey" FOREIGN KEY ("solicitado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_sedes" ADD CONSTRAINT "pedido_sedes_autorizado_por_usuario_id_fkey" FOREIGN KEY ("autorizado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_pedido" ADD CONSTRAINT "factura_pedido_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_pedido" ADD CONSTRAINT "factura_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_pedido" ADD CONSTRAINT "factura_pedido_relacionado_por_usuario_id_fkey" FOREIGN KEY ("relacionado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
