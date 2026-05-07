import { NavLink, useNavigate } from 'react-router-dom';
export default function Dashboard() {
  const stats = [
    ['Total Empleados', '25', '👥', 'text-blue-400'],
    ['Activos', '20', '✅', 'text-green-400'],
    ['Suspendidos', '3', '⚠️', 'text-amber-400'],
    ['Retirados', '2', '🚪', 'text-red-400'],
    ['Masa Salarial', 'Q120,000', '💰', 'text-purple-400'],
  ];

  const empleados = [
    {
      id: 1,
      nombres: 'Juan',
      apellidos: 'Pérez',
      cargo: 'Desarrollador',
      departamento: 'TI',
      estado: 'activo',
    },
    {
      id: 2,
      nombres: 'María',
      apellidos: 'López',
      cargo: 'Contadora',
      departamento: 'Finanzas',
      estado: 'activo',
    },
    {
      id: 3,
      nombres: 'Carlos',
      apellidos: 'Ramírez',
      cargo: 'Diseñador',
      departamento: 'Marketing',
      estado: 'suspendido',
    },
    {
      id: 4,
      nombres: 'Ana',
      apellidos: 'García',
      cargo: 'RRHH',
      departamento: 'Recursos Humanos',
      estado: 'activo',
    },
    {
      id: 5,
      nombres: 'Luis',
      apellidos: 'Morales',
      cargo: 'Soporte Técnico',
      departamento: 'TI',
      estado: 'retirado',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-blue-950/20 p-8">
        <h1 className="text-3xl font-bold text-white">
          Dashboard RRHH
        </h1>

        <p className="mt-2 text-slate-400">
          Resumen general del sistema de recursos humanos.
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(([label, value, icon, color]) => (
          <div
            key={String(label)}
            className="rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6"
          >
            <div className="mb-3 text-3xl">{icon}</div>

            <div className={`text-3xl font-bold ${color}`}>
              {value}
            </div>

            <p className="text-sm text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-blue-500/10 bg-slate-950/80 p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Empleados recientes
        </h2>

        <div className="space-y-3">
          {empleados.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between rounded-xl bg-slate-900 p-4"
            >
              <div>
                <p className="font-semibold text-white">
                  {emp.nombres} {emp.apellidos}
                </p>

                <p className="text-sm text-slate-400">
                  {emp.cargo} - {emp.departamento}
                </p>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-400">
                {emp.estado}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}