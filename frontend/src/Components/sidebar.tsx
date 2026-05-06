const links = [
  'Dashboard',
  'Empleados',
  'Nómina',
  'Expedientes',
  'Reportes',
];

export default function Sidebar() {
  return (
    <aside className="min-h-screen w-64 border-r border-blue-500/10 bg-slate-900 p-5">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white">RRHH</h2>
        <p className="text-sm text-slate-400">Panel administrativo</p>
      </div>

      <nav className="space-y-2">
        {links.map((label, index) => (
          <button
            key={label}
            className={`block w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              index === 0
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        className="mt-8 w-full rounded-xl bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}