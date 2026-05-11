-- CreateEnum
CREATE TYPE "EstadoMapeo" AS ENUM ('PENDIENTE', 'MAPEADO_AUTOMATICO', 'MAPEADO_MANUAL', 'REQUIERE_REVISION', 'IGNORADO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('CONTADO', 'CREDITO', 'CHEQUE', 'TRANSFERENCIA', 'MIXTO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PARCIAL', 'PAGADO', 'VENCIDO', 'ANULADO');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('ACTIVA', 'PENDIENTE_REVISION', 'BLOQUEADA', 'ANULADA', 'REEMPLAZADA');

-- CreateEnum
CREATE TYPE "TipoRelacionDocumento" AS ENUM ('FACTURA_PLANO', 'NOTA_CREDITO', 'VERSION', 'COMPLEMENTO', 'REEMPLAZO', 'ANULACION', 'REFERENCIA');

-- CreateEnum
CREATE TYPE "EstadoLecturaDocumento" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'EXITOSA', 'FALLIDA', 'REVISION_MANUAL');

-- CreateEnum
CREATE TYPE "ServicioLectura" AS ENUM ('OCR_CONTPYME', 'PARSER_CUTLIST', 'IMPORTADOR_MANUAL');

-- CreateTable
CREATE TABLE "documentos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo_documento_id" UUID NOT NULL,
    "titulo" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "sede_id" UUID,
    "creado_por_usuario_id" UUID NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_versiones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documento_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "ruta_archivo" VARCHAR(500) NOT NULL,
    "nombre_original" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(20) NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "peso_bytes" BIGINT NOT NULL,
    "hash_archivo" VARCHAR(128),
    "subido_por_usuario_id" UUID NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_versiones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documento_id" UUID NOT NULL,
    "sede_id" UUID NOT NULL,
    "cliente_id" UUID NOT NULL,
    "vendedor_id" UUID,
    "creado_por_usuario_id" UUID,
    "numero_factura" VARCHAR(50) NOT NULL,
    "fecha_factura" DATE NOT NULL,
    "tipo_pago" "TipoPago" NOT NULL,
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "estado_factura" "EstadoFactura" NOT NULL DEFAULT 'ACTIVA',
    "subtotal" DECIMAL(16,4) NOT NULL,
    "impuestos" DECIMAL(16,4) NOT NULL,
    "total" DECIMAL(16,4) NOT NULL,
    "saldo_pendiente" DECIMAL(16,4) NOT NULL,
    "fuente_saldo" VARCHAR(50),
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factura_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "factura_id" UUID NOT NULL,
    "item_id" UUID,
    "descripcion_original" VARCHAR(500) NOT NULL,
    "codigo_original" VARCHAR(100),
    "unidad_original" VARCHAR(50),
    "cantidad" DECIMAL(14,4) NOT NULL,
    "precio_unitario" DECIMAL(14,4) NOT NULL,
    "subtotal" DECIMAL(14,4) NOT NULL,
    "estado_mapeo" "EstadoMapeo" NOT NULL DEFAULT 'PENDIENTE',
    "mapeado_por_usuario_id" UUID,
    "fecha_mapeo" TIMESTAMP(3),
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factura_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_relacionados" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documento_origen_id" UUID NOT NULL,
    "documento_destino_id" UUID NOT NULL,
    "tipo_relacion" "TipoRelacionDocumento" NOT NULL,
    "relacionado_por_usuario_id" UUID,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documentos_relacionados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lectura_documentos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "documento_version_id" UUID NOT NULL,
    "estado_lectura" "EstadoLecturaDocumento" NOT NULL DEFAULT 'PENDIENTE',
    "procesado_por_usuario_id" UUID,
    "procesado_por_servicio" "ServicioLectura",
    "resultado_lectura" JSONB,
    "error_detalle" TEXT,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_fin" TIMESTAMP(3),
    "metadata" JSONB,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lectura_documentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "documentos_tipo_documento_id_idx" ON "documentos"("tipo_documento_id");

-- CreateIndex
CREATE INDEX "documentos_sede_id_idx" ON "documentos"("sede_id");

-- CreateIndex
CREATE INDEX "documentos_creado_por_usuario_id_idx" ON "documentos"("creado_por_usuario_id");

-- CreateIndex
CREATE INDEX "documentos_activo_idx" ON "documentos"("activo");

-- CreateIndex
CREATE INDEX "documentos_versiones_documento_id_idx" ON "documentos_versiones"("documento_id");

-- CreateIndex
CREATE INDEX "documentos_versiones_subido_por_usuario_id_idx" ON "documentos_versiones"("subido_por_usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_versiones_documento_id_version_key" ON "documentos_versiones"("documento_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_documento_id_key" ON "facturas"("documento_id");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numero_factura_key" ON "facturas"("numero_factura");

-- CreateIndex
CREATE INDEX "facturas_sede_id_idx" ON "facturas"("sede_id");

-- CreateIndex
CREATE INDEX "facturas_cliente_id_idx" ON "facturas"("cliente_id");

-- CreateIndex
CREATE INDEX "facturas_vendedor_id_idx" ON "facturas"("vendedor_id");

-- CreateIndex
CREATE INDEX "facturas_estado_factura_idx" ON "facturas"("estado_factura");

-- CreateIndex
CREATE INDEX "facturas_estado_pago_idx" ON "facturas"("estado_pago");

-- CreateIndex
CREATE INDEX "facturas_fecha_factura_idx" ON "facturas"("fecha_factura");

-- CreateIndex
CREATE INDEX "factura_items_factura_id_idx" ON "factura_items"("factura_id");

-- CreateIndex
CREATE INDEX "factura_items_item_id_idx" ON "factura_items"("item_id");

-- CreateIndex
CREATE INDEX "factura_items_estado_mapeo_idx" ON "factura_items"("estado_mapeo");

-- CreateIndex
CREATE INDEX "factura_items_mapeado_por_usuario_id_idx" ON "factura_items"("mapeado_por_usuario_id");

-- CreateIndex
CREATE INDEX "documentos_relacionados_documento_origen_id_idx" ON "documentos_relacionados"("documento_origen_id");

-- CreateIndex
CREATE INDEX "documentos_relacionados_documento_destino_id_idx" ON "documentos_relacionados"("documento_destino_id");

-- CreateIndex
CREATE UNIQUE INDEX "documentos_relacionados_documento_origen_id_documento_desti_key" ON "documentos_relacionados"("documento_origen_id", "documento_destino_id", "tipo_relacion");

-- CreateIndex
CREATE INDEX "lectura_documentos_documento_version_id_idx" ON "lectura_documentos"("documento_version_id");

-- CreateIndex
CREATE INDEX "lectura_documentos_estado_lectura_idx" ON "lectura_documentos"("estado_lectura");

-- CreateIndex
CREATE INDEX "lectura_documentos_procesado_por_usuario_id_idx" ON "lectura_documentos"("procesado_por_usuario_id");

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tipo_documento_id_fkey" FOREIGN KEY ("tipo_documento_id") REFERENCES "tipos_documento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_versiones" ADD CONSTRAINT "documentos_versiones_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_versiones" ADD CONSTRAINT "documentos_versiones_subido_por_usuario_id_fkey" FOREIGN KEY ("subido_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_documento_id_fkey" FOREIGN KEY ("documento_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_vendedor_id_fkey" FOREIGN KEY ("vendedor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_creado_por_usuario_id_fkey" FOREIGN KEY ("creado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_factura_id_fkey" FOREIGN KEY ("factura_id") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factura_items" ADD CONSTRAINT "factura_items_mapeado_por_usuario_id_fkey" FOREIGN KEY ("mapeado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_relacionados" ADD CONSTRAINT "documentos_relacionados_documento_origen_id_fkey" FOREIGN KEY ("documento_origen_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_relacionados" ADD CONSTRAINT "documentos_relacionados_documento_destino_id_fkey" FOREIGN KEY ("documento_destino_id") REFERENCES "documentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_relacionados" ADD CONSTRAINT "documentos_relacionados_relacionado_por_usuario_id_fkey" FOREIGN KEY ("relacionado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectura_documentos" ADD CONSTRAINT "lectura_documentos_documento_version_id_fkey" FOREIGN KEY ("documento_version_id") REFERENCES "documentos_versiones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lectura_documentos" ADD CONSTRAINT "lectura_documentos_procesado_por_usuario_id_fkey" FOREIGN KEY ("procesado_por_usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
