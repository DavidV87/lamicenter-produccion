/*
  Warnings:

  - The values [MAQUINA] on the enum `AplicaNovedadA` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AplicaNovedadA_new" AS ENUM ('PEDIDO', 'ORDEN_PRODUCCION', 'SUBORDEN', 'DESPACHO', 'COMPRA', 'MATERIAL', 'GENERAL');
ALTER TABLE "tipos_novedad" ALTER COLUMN "aplica_a" TYPE "AplicaNovedadA_new" USING ("aplica_a"::text::"AplicaNovedadA_new");
ALTER TYPE "AplicaNovedadA" RENAME TO "AplicaNovedadA_old";
ALTER TYPE "AplicaNovedadA_new" RENAME TO "AplicaNovedadA";
DROP TYPE "AplicaNovedadA_old";
COMMIT;

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "sede_principal_id" UUID;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "permite_fraccion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "tipos_documento" ADD COLUMN     "requiere_versionamiento" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "clientes_sede_principal_id_idx" ON "clientes"("sede_principal_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_sede_principal_id_fkey" FOREIGN KEY ("sede_principal_id") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
