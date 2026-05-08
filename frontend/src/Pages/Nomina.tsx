export default function Nomina() {
  const empleados = [
    {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      salario: 4500,
      cargo: 'Desarrollador',
      departamento: 'TI',
    },
    {
      id: 2,
      nombres: 'María',
      apellidos: 'López',
      salario: 5200,
      cargo: 'Contadora',
      departamento: 'Finanzas',
    },
  ];

  const detalles = [
    {
      id: 1,
      empleado: 'Juan Pérez',
      salario: 4500,
      horasExtra: 5,
      bonos: 500,
      deducciones: 250,
      total: 4750,
    },
    {
      id: 2,
      empleado: 'María López',
      salario: 5200,
      horasExtra: 2,
      bonos: 300,
      deducciones: 400,
      total: 5100,
    },
  ];

  return (
    <div className="space-y-8 text-white">
      <section className="overflow-hidden rounded-3xl border border-blue-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-blue-400">
              Recursos Humanos
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Módulo de Nómina
            </h1>

            <p className="mt-3 max-w-3xl text-slate-400">
              Administra períodos, salarios y pagos de empleados.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">
              Nómina activa
            </p>

            <p className="mt-1 text-2xl font-black text-white">
              Abril 2026
            </p>

            <p className="mt-1 text-sm text-blue-300">
              Mensual · abierta
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-4">
        <Card titulo="Total planilla" valor="Q9,850.00" />
        <Card titulo="Bonos" valor="Q800.00" />
        <Card titulo="Deducciones" valor="Q650.00" />
        <Card titulo="Empleados" valor="2" />
      </section>

      <section className="grid gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <Panel
            paso="01"
            titulo="Crear período"
            descripcion="Configuración visual del período."
          >
            <div className="space-y-4">
              <Campo label="Tipo período">
                <select className="input">
                  <option>Mensual</option>
                  <option>Quincenal</option>
                </select>
              </Campo>

              <Campo label="Período">
                <input
                  placeholder="2026-04"
                  className="input"
                />
              </Campo>

              <Campo label="Fecha inicio">
                <input type="date" className="input" />
              </Campo>

              <Campo label="Fecha fin">
                <input type="date" className="input" />
              </Campo>

              <button className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700">
                Crear período
              </button>
            </div>
          </Panel>
        </div>

        <div className="xl:col-span-8">
          <Panel
            paso="02"
            titulo="Manipular nómina"
            descripcion="Pantalla visual para futuros cálculos."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-lg font-black">
                  Datos del empleado
                </h3>

                <div className="mt-5 space-y-4">
                  <Campo label="Empleado">
                    <select className="input">
                      {empleados.map((e) => (
                        <option key={e.id}>
                          {e.nombres} {e.apellidos}
                        </option>
                      ))}
                    </select>
                  </Campo>

                  <Input label="Horas trabajadas" />
                  <Input label="Horas extra" />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                <h3 className="text-lg font-black">
                  Conceptos salariales
                </h3>

                <div className="mt-5 space-y-4">
                  <Input label="Bonificaciones" />
                  <Input label="Comisiones" />
                  <Input label="Deducciones" />
                  <Input label="Descuentos legales" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-blue-500/10 bg-slate-950 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Resumen label="Salario base" value="Q4,500.00" />
                <Resumen label="Pago hora" value="Q18.75" />
                <Resumen label="Monto extra" value="Q140.00" />
                <Resumen label="Ingresos" value="Q5,000.00" />
                <Resumen label="Deducciones" value="Q250.00" />
                <Resumen
                  label="Total estimado"
                  value="Q4,750.00"
                  strong
                />
              </div>

              <button className="mt-6 rounded-2xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700">
                Agregar empleado
              </button>
            </div>
          </Panel>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-xl font-black">
            Detalle de nómina
          </h2>

          <p className="text-sm text-slate-400">
            Vista visual de empleados agregados.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-slate-400">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-3">Empleado</th>
                <th className="px-4 py-3">Salario</th>
                <th className="px-4 py-3">Horas Extra</th>
                <th className="px-4 py-3">Bonos</th>
                <th className="px-4 py-3">Deducciones</th>
                <th className="px-4 py-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {detalles.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-900 text-slate-300 hover:bg-slate-900/60"
                >
                  <td className="px-4 py-4 font-semibold text-white">
                    {d.empleado}
                  </td>

                  <td className="px-4 py-4">
                    Q{d.salario}
                  </td>

                  <td className="px-4 py-4">
                    {d.horasExtra}
                  </td>

                  <td className="px-4 py-4">
                    Q{d.bonos}
                  </td>

                  <td className="px-4 py-4">
                    Q{d.deducciones}
                  </td>

                  <td className="px-4 py-4 text-lg font-black text-emerald-400">
                    Q{d.total}
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

function Panel({ paso, titulo, descripcion, children }: any) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-400">
        Paso {paso}
      </p>

      <h2 className="mt-1 text-xl font-black text-white">
        {titulo}
      </h2>

      <p className="mt-1 mb-6 text-sm text-slate-400">
        {descripcion}
      </p>

      {children}
    </section>
  );
}

function Campo({ label, children }: any) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-300">
        {label}
      </label>

      {children}
    </div>
  );
}

function Input({ label }: any) {
  return (
    <Campo label={label}>
      <input
        type="number"
        className="input"
      />
    </Campo>
  );
}

function Card({ titulo, valor }: any) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6 shadow-xl">
      <p className="text-sm text-slate-400">{titulo}</p>

      <p className="mt-2 text-2xl font-black text-white">
        {valor}
      </p>
    </div>
  );
}

function Resumen({ label, value, strong }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-4 py-3">
      <span className="text-slate-400">{label}</span>

      <span
        className={
          strong
            ? 'font-black text-emerald-400'
            : 'font-bold text-blue-400'
        }
      >
        {value}
      </span>
    </div>
  );
}