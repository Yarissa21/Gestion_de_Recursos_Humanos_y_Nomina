const documentosObligatorios = [
  'DPI',
  'Contrato firmado',
  'Certificado de estudios',
  'Antecedentes penales',
  'Antecedentes policiales',
];

export default function Expedientes() {
  const empleados = [
    { id: 1, nombres: 'Juan', apellidos: 'Pérez' },
    { id: 2, nombres: 'María', apellidos: 'López' },
    { id: 3, nombres: 'Carlos', apellidos: 'Ramírez' },
  ];

  const documentos = [
    {
      id: 1,
      tipo: 'DPI',
      nombre: 'dpi_juan_perez.pdf',
    },
    {
      id: 2,
      tipo: 'Contrato firmado',
      nombre: 'contrato_juan_perez.pdf',
    },
  ];

  const faltantes = [
    'Certificado de estudios',
    'Antecedentes penales',
    'Antecedentes policiales',
  ];

  const estado = 'En proceso';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Expedientes
        </h1>

        <p className="text-slate-400">
          Carga y validación de documentos del empleado
        </p>
      </div>

      <section className="rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6">
        <label className="mb-2 block text-sm text-slate-300">
          Empleado
        </label>

        <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white">
          <option>Seleccionar empleado</option>

          {empleados.map((emp) => (
            <option key={emp.id}>
              {emp.nombres} {emp.apellidos}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Estado del expediente
        </h2>

        <span className="rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400">
          {estado}
        </span>

        <div className="mt-5">
          <p className="mb-2 text-sm text-slate-400">
            Documentos faltantes:
          </p>

          <div className="flex flex-wrap gap-2">
            {faltantes.map((doc) => (
              <span
                key={doc}
                className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
              >
                {doc}
              </span>
            ))}
          </div>
        </div>
      </section>

      <form className="grid gap-4 rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6 md:grid-cols-3">
        <select className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white">
          {documentosObligatorios.map((doc) => (
            <option key={doc}>{doc}</option>
          ))}
        </select>

        <input
          type="file"
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
        />

        <button
          type="button"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Subir documento
        </button>
      </form>

      <section className="rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Documentos cargados
        </h2>

        <div className="space-y-3">
          {documentos.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between rounded-xl bg-slate-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">
                  {doc.tipo}
                </p>

                <p className="text-sm text-slate-400">
                  {doc.nombre}
                </p>
              </div>

              <button
                type="button"
                className="text-blue-400 hover:text-blue-300"
              >
                Descargar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}