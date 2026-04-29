function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-blue-600 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center">
        <h1 className="text-5xl font-bold text-blue-900">RRHH</h1>

        <h2 className="mt-3 text-2xl font-bold text-gray-900">
          Iniciar sesión
        </h2>


        <form className="space-y-5">
          <div className="text-left">
            <label className="block mb-2 font-semibold text-gray-700">
              Ingrese Correo Electronico
            </label>
            <input
              type="email"
              placeholder="ejemplo@gmail.com"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="text-left">
            <label className="block mb-2 font-semibold text-gray-700">
              Ingrese Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-800"
          >
            Iniciar Sesion
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;