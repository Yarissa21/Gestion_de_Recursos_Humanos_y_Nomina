-- AlterTable
ALTER TABLE "DocumentoAcademico" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InformacionAcademica" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TipoDocumentoAcademico" ADD COLUMN     "eliminado" BOOLEAN NOT NULL DEFAULT false;
