export default function Empleados() {
  const empleados = [
    {
      id: 1,
      nombres: 'Juan Pérez',
      dpi: '1234567890101',
      email: 'juan@empresa.com',
      telefono: '5555-1111',
      cargo: 'Desarrollador',
      departamento: 'TI',
      salario: 'Q8,500',
      estado: 'Activo',
    },
    {
      id: 2,
      nombres: 'María López',
      dpi: '2234567890101',
      email: 'maria@empresa.com',
      telefono: '5555-2222',
      cargo: 'Analista RRHH',
      departamento: 'Recursos Humanos',
      salario: 'Q7,200',
      estado: 'Suspendido',
    },
    {
      id: 3,
      nombres: 'Carlos Méndez',
      dpi: '3234567890101',
      email: 'carlos@empresa.com',
      telefono: '5555-3333',
      cargo: 'Contador',
      departamento: 'Finanzas',
      salario: 'Q9,000',
      estado: 'Retirado',
    },
  ];

  return (
    <div className="min-h-screen space-y-8 bg-slate-950 p-6 text-white">
      <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 p-8 shadow-2xl shadow-cyan-500/10">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">
          Sistema RRHH
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">
          Gestión de Empleados
        </h1>
        <p className="mt-2 max-w-2xl text-slate-400">
          Panel visual futurista para crear, consultar y administrar empleados.
        </p>
      </div>

      <section className="grid gap-5 md:grid-cols-4">
        {[
          ['Total', '125', '👥'],
          ['Activos', '98', '🟢'],
          ['Suspendidos', '12', '🟡'],
          ['Retirados', '15', '🔴'],
        ].map(([titulo, valor, icono]) => (
          <div
            key={titulo}
            className="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5 shadow-lg shadow-cyan-500/5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{titulo}</p>
              <span className="text-2xl">{icono}</span>
            </div>
            <h2 className="mt-3 text-3xl font-bold text-cyan-300">{valor}</h2>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-blue-500/20 bg-slate-900/80 p-6 shadow-2xl shadow-blue-500/10">
        <h2 className="mb-5 text-2xl font-bold text-cyan-300">
          Nuevo empleado
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            'Nombres',
            'Apellidos',
            'DPI',
            'Fecha nacimiento',
            'Dirección',
            'Teléfono',
            'Email',
            'Salario',
            'Cargo',
            'Departamento',
          ].map((label) => (
            <div key={label}>
              <label className="mb-1 block text-sm text-slate-400">
                {label}
              </label>
              <input
                type={
                  label === 'Fecha nacimiento'
                    ? 'date'
                    : label === 'Email'
                      ? 'email'
                      : label === 'Salario'
                        ? 'number'
                        : 'text'
                }
                placeholder={label}
                className="w-full rounded-xl border border-cyan-400/20 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/20"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-300"
          >
            Crear empleado
          </button>

          <button
            type="button"
            className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
          >
            Limpiar
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/80 shadow-2xl shadow-cyan-500/10">
        <div className="flex items-center justify-between border-b border-cyan-400/10 px-6 py-5">
          <h2 className="text-2xl font-bold text-cyan-300">
            Lista de empleados
          </h2>
          <span className="rounded-full bg-cyan-400/10 px-4 py-1 text-sm text-cyan-300">
            3 registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-cyan-400/5">
              <tr>
                {[
                  'Empleado',
                  'DPI',
                  'Contacto',
                  'Cargo',
                  'Departamento',
                  'Salario',
                  'Estado',
                  'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {empleados.map((emp) => (
                <tr
                  key={emp.id}
                  className="border-t border-cyan-400/10 transition hover:bg-cyan-400/5"
                >
                  <td className="px-5 py-4 font-semibold">{emp.nombres}</td>
                  <td className="px-5 py-4 text-slate-400">{emp.dpi}</td>
                  <td className="px-5 py-4">
                    <p className="text-slate-300">{emp.telefono}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-300">{emp.cargo}</td>
                  <td className="px-5 py-4 text-slate-300">
                    {emp.departamento}
                  </td>
                  <td className="px-5 py-4 font-bold text-cyan-300">
                    {emp.salario}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        emp.estado === 'Activo'
                          ? 'bg-green-500/10 text-green-400'
                          : emp.estado === 'Suspendido'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {emp.estado}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/20"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}