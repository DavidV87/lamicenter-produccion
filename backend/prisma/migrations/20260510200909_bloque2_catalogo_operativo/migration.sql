-- CreateEnum
CREATE TYPE "ComportamientoTipoItem" AS ENUM ('PRODUCTO', 'SERVICIO', 'MATERIA_PRIMA', 'INSUMO');

-- CreateEnum
CREATE TYPE "UnidadMedida" AS ENUM ('METRO_CUADRADO', 'METRO_LINEAL', 'UNIDAD', 'HOJA', 'KILOGRAMO', 'LITRO', 'METRO_CUBICO');

-- CreateEnum
CREATE TYPE "TipoIdentificacion" AS ENUM ('NIT', 'CC', 'CE', 'PAS', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoProveedor" AS ENUM ('MATERIAL', 'SERVICIO', 'TRANSPORTE', 'MIXTO');

-- CreateEnum
CREATE TYPE "AplicaNovedadA" AS ENUM ('ORDEN_PRODUCCION', 'PEDIDO', 'MAQUINA', 'MATERIAL', 'DESPACHO', 'GENERAL');

-- CreateTable
CREATE TABLE "tipos_item" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "comportamiento" "ComportamientoTipoItem" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tipo_item_id" UUID NOT NULL,
    "codigo" VARCHAR(80) NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "unidad_medida" "UnidadMedida" NOT NULL,
    "precio_venta_referencia" DECIMAL(14,4),
    "costo_referencia" DECIMAL(14,4),
    "controla_inventario" BOOLEAN NOT NULL DEFAULT false,
    "requiere_corte" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "razon_social" VARCHAR(200) NOT NULL,
    "nombre_comercial" VARCHAR(200),
    "identificacion" VARCHAR(30) NOT NULL,
    "tipo_identificacion" "TipoIdentificacion" NOT NULL,
    "telefono" VARCHAR(30),
    "correo" VARCHAR(150),
    "direccion" VARCHAR(255),
    "ciudad" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactos_cliente" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "cargo" VARCHAR(100),
    "telefono" VARCHAR(30),
    "correo" VARCHAR(150),
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contactos_cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "razon_social" VARCHAR(200) NOT NULL,
    "nombre_comercial" VARCHAR(200),
    "identificacion" VARCHAR(30) NOT NULL,
    "tipo_identificacion" "TipoIdentificacion" NOT NULL,
    "tipo_proveedor" "TipoProveedor" NOT NULL,
    "telefono" VARCHAR(30),
    "correo" VARCHAR(150),
    "direccion" VARCHAR(255),
    "ciudad" VARCHAR(100),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maquinas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sede_id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "maquinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ubicaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sede_id" UUID NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "codigo" VARCHAR(50) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ubicaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_novedad" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "aplica_a" "AplicaNovedadA" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_novedad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_documento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" VARCHAR(100) NOT NULL,
    "codigo" VARCHAR(30) NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_item_nombre_key" ON "tipos_item"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "items_codigo_key" ON "items"("codigo");

-- CreateIndex
CREATE INDEX "items_codigo_idx" ON "items"("codigo");

-- CreateIndex
CREATE INDEX "items_tipo_item_id_idx" ON "items"("tipo_item_id");

-- CreateIndex
CREATE INDEX "items_activo_idx" ON "items"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_identificacion_key" ON "clientes"("identificacion");

-- CreateIndex
CREATE INDEX "clientes_activo_idx" ON "clientes"("activo");

-- CreateIndex
CREATE INDEX "contactos_cliente_cliente_id_idx" ON "contactos_cliente"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_identificacion_key" ON "proveedores"("identificacion");

-- CreateIndex
CREATE INDEX "proveedores_activo_idx" ON "proveedores"("activo");

-- CreateIndex
CREATE INDEX "proveedores_tipo_proveedor_idx" ON "proveedores"("tipo_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "maquinas_codigo_key" ON "maquinas"("codigo");

-- CreateIndex
CREATE INDEX "maquinas_sede_id_idx" ON "maquinas"("sede_id");

-- CreateIndex
CREATE INDEX "maquinas_activo_idx" ON "maquinas"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "ubicaciones_codigo_key" ON "ubicaciones"("codigo");

-- CreateIndex
CREATE INDEX "ubicaciones_sede_id_idx" ON "ubicaciones"("sede_id");

-- CreateIndex
CREATE INDEX "ubicaciones_activo_idx" ON "ubicaciones"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_novedad_nombre_key" ON "tipos_novedad"("nombre");

-- CreateIndex
CREATE INDEX "tipos_novedad_aplica_a_idx" ON "tipos_novedad"("aplica_a");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_nombre_key" ON "tipos_documento"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_documento_codigo_key" ON "tipos_documento"("codigo");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_tipo_item_id_fkey" FOREIGN KEY ("tipo_item_id") REFERENCES "tipos_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactos_cliente" ADD CONSTRAINT "contactos_cliente_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maquinas" ADD CONSTRAINT "maquinas_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ubicaciones" ADD CONSTRAINT "ubicaciones_sede_id_fkey" FOREIGN KEY ("sede_id") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
