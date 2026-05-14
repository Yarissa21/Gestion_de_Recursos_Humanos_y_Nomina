/*
  Warnings:

  - A unique constraint covering the columns `[correo]` on the table `Empleado` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Empleado" ADD COLUMN     "correo" TEXT,
ADD COLUMN     "id_puesto" INTEGER;

-- CreateTable
CREATE TABLE "PuestoTrabajo" (
    "id_puesto" SERIAL NOT NULL,
    "nombre_puesto" TEXT NOT NULL,
    "eliminado" BOOLEAN NOT NULL DEFAULT false,
    "id_departamento" INTEGER NOT NULL,

    CONSTRAINT "PuestoTrabajo_pkey" PRIMARY KEY ("id_puesto")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_correo_key" ON "Empleado"("correo");

-- AddForeignKey
ALTER TABLE "PuestoTrabajo" ADD CONSTRAINT "PuestoTrabajo_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamento"("id_departamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_id_puesto_fkey" FOREIGN KEY ("id_puesto") REFERENCES "PuestoTrabajo"("id_puesto") ON DELETE SET NULL ON UPDATE CASCADE;
