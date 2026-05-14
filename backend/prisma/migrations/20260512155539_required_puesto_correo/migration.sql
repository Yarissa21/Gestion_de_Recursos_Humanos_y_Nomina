/*
  Warnings:

  - Made the column `correo` on table `Empleado` required. This step will fail if there are existing NULL values in that column.
  - Made the column `id_puesto` on table `Empleado` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Empleado" DROP CONSTRAINT "Empleado_id_puesto_fkey";

-- AlterTable
ALTER TABLE "Empleado" ALTER COLUMN "correo" SET NOT NULL,
ALTER COLUMN "id_puesto" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_id_puesto_fkey" FOREIGN KEY ("id_puesto") REFERENCES "PuestoTrabajo"("id_puesto") ON DELETE RESTRICT ON UPDATE CASCADE;
