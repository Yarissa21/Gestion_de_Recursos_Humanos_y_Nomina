/*
  Warnings:

  - A unique constraint covering the columns `[id_empleado]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "id_empleado" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_id_empleado_key" ON "Usuario"("id_empleado");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE SET NULL ON UPDATE CASCADE;
