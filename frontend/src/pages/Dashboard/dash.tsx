// src/pages/Dashboard/dash.tsx
export default function Dashboard() {
  return (
    <div className="bg-gray-100 font-sans min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-blue-600 text-2xl font-bold">👥 Sistema de RRHH</span>
          <ul className="flex space-x-6 text-gray-700 font-medium">
            <li className="text-blue-600 font-semibold">Dashboard</li>
            <li>Mi Perfil</li>
            <li>Configuración</li>
            <li>💲 Nómina</li>
            <li className="text-red-600 font-semibold">Cerrar Sesión</li>
          </ul>
        </div>
      </nav>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto mt-8 px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard de Recursos Humanos</h1>
        <p className="text-gray-600 mb-6">Bienvenido, admin (ADMIN)</p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-700 font-semibold">Total Usuarios</h2>
            <p className="text-3xl font-bold mt-2">1</p>
            <p className="text-gray-500 text-sm">Empleados: 0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-700 font-semibold">Nóminas Generadas</h2>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-gray-500 text-sm">Gestión de pagos</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-700 font-semibold">Áreas</h2>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-gray-500 text-sm">Configuradas en el sistema</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-gray-700 font-semibold">Documentos</h2>
            <p className="text-3xl font-bold mt-2">0</p>
            <p className="text-gray-500 text-sm">Subidos al sistema</p>
          </div>
        </div>

        {/* Secciones inferiores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Últimas Nóminas</h3>
            <p className="text-gray-500">No hay nóminas generadas</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Áreas Configuradas</h3>
            <p className="text-gray-500">No hay áreas configuradas</p>
          </div>
        </div>
      </main>
    </div>
  );
}
