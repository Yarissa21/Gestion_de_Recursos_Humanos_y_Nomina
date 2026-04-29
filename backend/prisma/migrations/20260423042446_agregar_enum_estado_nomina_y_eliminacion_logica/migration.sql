/*
  Warnings:

  - The `estado` column on the `Nomina` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EstadoNomina" AS ENUM ('Pendiente', 'Procesada', 'Cerrada');

-- AlterTable
ALTER TABLE "ConceptoNomina" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "DetalleConceptoNomina" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "DetalleNomina" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Nomina" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "estado",
ADD COLUMN     "estado" "EstadoNomina" NOT NULL DEFAULT 'Pendiente';
