/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `sedes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "auditoria_general" ADD COLUMN     "user_agent" VARCHAR(500);

-- AlterTable
ALTER TABLE "sedes" ADD COLUMN     "codigo" VARCHAR(20),
ADD COLUMN     "correo" VARCHAR(150);

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "ultimo_acceso" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "sedes_codigo_key" ON "sedes"("codigo");
