export default function Login() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl grid grid-cols-1 lg:grid-cols-2">
        
        <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 p-12 text-white">
          <div>
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
              RH
            </div>

            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Sistema de Recursos Humanos y Nómina
            </h1>

            <p className="mt-5 text-blue-100 text-lg">
              Administra empleados, expedientes, nómina y reportes desde una plataforma moderna y segura.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
            <p className="text-sm text-blue-100">Panel administrativo</p>
            <h2 className="mt-1 text-2xl font-semibold">RRHH & Nómina</h2>
            <p className="mt-3 text-sm text-blue-100">
              Acceso exclusivo para personal autorizado.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
              Bienvenido
            </p>

            <h2 className="mt-3 text-4xl font-bold text-slate-900">
              Iniciar sesión
            </h2>

            <p className="mt-3 text-slate-500">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Usuario
              </label>

              <input
                type="text"
                placeholder="Ej. admin"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Contraseña
              </label>

              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                Recordarme
              </label>


            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99]"
            >
              Entrar al sistema
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400">
            © 2026 Sistema de Recursos Humanos y Nómina
          </p>
        </div>
      </div>
    </div>
  );
}
