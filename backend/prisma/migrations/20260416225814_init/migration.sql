-- CreateTable
CREATE TABLE "Departamento" (
    "id_departamento" SERIAL NOT NULL,
    "nombre_departamento" TEXT NOT NULL,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id_departamento")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id_empleado" SERIAL NOT NULL,
    "nombre_empleado" TEXT NOT NULL,
    "apellido_empleado" TEXT NOT NULL,
    "dpi" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "salario" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL,
    "id_departamento" INTEGER NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id_empleado")
);

-- CreateTable
CREATE TABLE "InformacionAcademica" (
    "id_academico" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "certificacion" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "fecha_graduacion" TIMESTAMP(3) NOT NULL,
    "id_empleado" INTEGER NOT NULL,

    CONSTRAINT "InformacionAcademica_pkey" PRIMARY KEY ("id_academico")
);

-- CreateTable
CREATE TABLE "DocumentoAcademico" (
    "id_doc_academico" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "fecha_carga" TIMESTAMP(3) NOT NULL,
    "id_academico" INTEGER NOT NULL,
    "id_tipo_doc_academico" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "DocumentoAcademico_pkey" PRIMARY KEY ("id_doc_academico")
);

-- CreateTable
CREATE TABLE "TipoDocumentoAcademico" (
    "id_tipo_doc_academico" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL,

    CONSTRAINT "TipoDocumentoAcademico_pkey" PRIMARY KEY ("id_tipo_doc_academico")
);

-- CreateTable
CREATE TABLE "DocumentoExpediente" (
    "id_documento" SERIAL NOT NULL,
    "nombre_documento" TEXT NOT NULL,
    "archivo" TEXT NOT NULL,
    "fecha_carga" TIMESTAMP(3) NOT NULL,
    "id_tipo" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "DocumentoExpediente_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "TipoDocumento" (
    "id_tipo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "obligatorio" BOOLEAN NOT NULL,

    CONSTRAINT "TipoDocumento_pkey" PRIMARY KEY ("id_tipo")
);

-- CreateTable
CREATE TABLE "ValidacionExpediente" (
    "id_validacion" SERIAL NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_empleado" INTEGER NOT NULL,

    CONSTRAINT "ValidacionExpediente_pkey" PRIMARY KEY ("id_validacion")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Nomina" (
    "id_nomina" SERIAL NOT NULL,
    "periodo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL,

    CONSTRAINT "Nomina_pkey" PRIMARY KEY ("id_nomina")
);

-- CreateTable
CREATE TABLE "DetalleNomina" (
    "id_detalle" SERIAL NOT NULL,
    "salario_base" DOUBLE PRECISION NOT NULL,
    "horas_trabajadas" DOUBLE PRECISION NOT NULL,
    "horas_extra" DOUBLE PRECISION NOT NULL,
    "id_nomina" INTEGER NOT NULL,
    "id_empleado" INTEGER NOT NULL,

    CONSTRAINT "DetalleNomina_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateTable
CREATE TABLE "ConceptoNomina" (
    "id_concepto" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,

    CONSTRAINT "ConceptoNomina_pkey" PRIMARY KEY ("id_concepto")
);

-- CreateTable
CREATE TABLE "DetalleConceptoNomina" (
    "id_detalle_concepto" SERIAL NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "id_detalle" INTEGER NOT NULL,
    "id_concepto" INTEGER NOT NULL,

    CONSTRAINT "DetalleConceptoNomina_pkey" PRIMARY KEY ("id_detalle_concepto")
);

-- CreateTable
CREATE TABLE "AjusteNomina" (
    "id_ajuste" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "valor_anterior" DOUBLE PRECISION NOT NULL,
    "valor_nuevo" DOUBLE PRECISION NOT NULL,
    "campo_modificado" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_detalle" INTEGER,
    "id_detalle_concepto" INTEGER,

    CONSTRAINT "AjusteNomina_pkey" PRIMARY KEY ("id_ajuste")
);

-- CreateIndex
CREATE UNIQUE INDEX "ValidacionExpediente_id_empleado_key" ON "ValidacionExpediente"("id_empleado");

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_id_departamento_fkey" FOREIGN KEY ("id_departamento") REFERENCES "Departamento"("id_departamento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformacionAcademica" ADD CONSTRAINT "InformacionAcademica_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAcademico" ADD CONSTRAINT "DocumentoAcademico_id_academico_fkey" FOREIGN KEY ("id_academico") REFERENCES "InformacionAcademica"("id_academico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAcademico" ADD CONSTRAINT "DocumentoAcademico_id_tipo_doc_academico_fkey" FOREIGN KEY ("id_tipo_doc_academico") REFERENCES "TipoDocumentoAcademico"("id_tipo_doc_academico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoAcademico" ADD CONSTRAINT "DocumentoAcademico_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoExpediente" ADD CONSTRAINT "DocumentoExpediente_id_tipo_fkey" FOREIGN KEY ("id_tipo") REFERENCES "TipoDocumento"("id_tipo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoExpediente" ADD CONSTRAINT "DocumentoExpediente_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoExpediente" ADD CONSTRAINT "DocumentoExpediente_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidacionExpediente" ADD CONSTRAINT "ValidacionExpediente_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleNomina" ADD CONSTRAINT "DetalleNomina_id_nomina_fkey" FOREIGN KEY ("id_nomina") REFERENCES "Nomina"("id_nomina") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleNomina" ADD CONSTRAINT "DetalleNomina_id_empleado_fkey" FOREIGN KEY ("id_empleado") REFERENCES "Empleado"("id_empleado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleConceptoNomina" ADD CONSTRAINT "DetalleConceptoNomina_id_detalle_fkey" FOREIGN KEY ("id_detalle") REFERENCES "DetalleNomina"("id_detalle") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetalleConceptoNomina" ADD CONSTRAINT "DetalleConceptoNomina_id_concepto_fkey" FOREIGN KEY ("id_concepto") REFERENCES "ConceptoNomina"("id_concepto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteNomina" ADD CONSTRAINT "AjusteNomina_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "Usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteNomina" ADD CONSTRAINT "AjusteNomina_id_detalle_fkey" FOREIGN KEY ("id_detalle") REFERENCES "DetalleNomina"("id_detalle") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjusteNomina" ADD CONSTRAINT "AjusteNomina_id_detalle_concepto_fkey" FOREIGN KEY ("id_detalle_concepto") REFERENCES "DetalleConceptoNomina"("id_detalle_concepto") ON DELETE SET NULL ON UPDATE CASCADE;
