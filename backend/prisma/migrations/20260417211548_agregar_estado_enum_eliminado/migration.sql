/*
  Warnings:

  - The `estado` column on the `Empleado` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoEmpleado" AS ENUM ('Activo', 'Suspendido', 'Retirado');

-- AlterTable
ALTER TABLE "Empleado" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoEmpleado" NOT NULL DEFAULT 'Activo';
