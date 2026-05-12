import { useEffect, useState } from "react";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState(0);
  const [nominas, setNominas] = useState(0);
  const [areas, setAreas] = useState(0);
  const [documentos, setDocumentos] = useState(0);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(data.total));

    fetch("http://localhost:3000/nominas")
      .then(res => res.json())
      .then(data => setNominas(data.total));

    fetch("http://localhost:3000/api/areas")
      .then(res => res.json())
      .then(data => setAreas(data.total));

    fetch("http://localhost:3000/documentos")
      .then(res => res.json())
      .then(data => setDocumentos(data.total));

    fetch("http://localhost:3000/empleados")
      .then(res => res.json())
      .then(data => setEmpleados(data));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-9 h-9 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="text-2xl font-bold">Sistema de RRHH</h3>
          </div>

          <div className="flex items-center gap-8 px-4 py-3">
            <a href="/dashboard" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Dashboard
            </a>
            <a href="/perfil" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Mi Perfil
            </a>
            <a href="/configuracion" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Configuración
            </a>
            <a href="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Nómina
            </a>
            <button className="px-4 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition ml-2">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 mt-16">
        <h1 className="text-4xl font-bold mb-6">Dashboard de Recursos Humanos</h1>
        <p className="text-gray-600 mb-12">Bienvenido, admin (ADMIN)</p>

        {/* Tarjetas superiores */}
        <div className="flex flex-wrap gap-8">
          <div className="card bg-white p-6 rounded-xl shadow-sm flex-1 min-w-[220px]">
            <h2>Total Usuarios</h2>
            <p className="text-4xl font-bold mt-3">{usuarios}</p>
          </div>
          <div className="card bg-white p-6 rounded-xl shadow-sm flex-1 min-w-[220px]">
            <h2>Nóminas Generadas</h2>
            <p className="text-4xl font-bold mt-3">{nominas}</p>
          </div>
          <div className="card bg-white p-6 rounded-xl shadow-sm flex-1 min-w-[220px]">
            <h2>Áreas</h2>
            <p className="text-4xl font-bold mt-3">{areas}</p>
          </div>
          <div className="card bg-white p-6 rounded-xl shadow-sm flex-1 min-w-[220px]">
            <h2>Documentos</h2>
            <p className="text-4xl font-bold mt-3">{documentos}</p>
          </div>
        </div>

        {/* Tabla de empleados */}
        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mt-12">
          <h3 className="text-lg font-semibold mb-3">Empleados Registrados</h3>
          {empleados.length === 0 ? (
            <p className="text-gray-500">No hay empleados registrados</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Apellido</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map(emp => (
                  <tr key={emp.id_empleado} className="border-t">
                    <td className="p-2">{emp.id_empleado}</td>
                    <td className="p-2">{emp.nombre_empleado}</td>
                    <td className="p-2">{emp.apellido_empleado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
