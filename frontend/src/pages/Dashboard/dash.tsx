import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";

  useEffect(() => {
    if (rol === "admin" || rol === "userrh") {
      fetch("http://localhost:3000/api/usuarios")
        .then(res => res.json())
        .then(data => setUsuarios(data.total));

      fetch("http://localhost:3000/nomina")
        .then(res => res.json())
        .then(data => setNominas(data.length));

      fetch("http://localhost:3000/api/areas")
        .then(res => res.json())
        .then(data => setAreas(data.total));

      fetch("http://localhost:3000/documentos")
        .then(res => res.json())
        .then(data => setDocumentos(data.total));
    }

    if (rol === "admin") {
      fetch("http://localhost:3000/empleados")
        .then(res => res.json())
        .then(data => setEmpleados(data));
    }

    if (rol === "user") {
      fetch("http://localhost:3000/nomina")
        .then(res => res.json())
        .then(data => setNominas(data.length)); 
    }
  }, [rol]);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
          <h3 className="text-2xl font-bold">Sistema de RRHH</h3>
          <div className="flex items-center gap-8 px-4 py-3">
            <Link to="/dashboard" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
              Dashboard
            </Link>
            {rol === "admin" && (
              <>
                <Link to="/configAreas" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                  Configuración
                </Link>
                <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                  Nómina
                </Link>
              </>
            )}
            {rol === "userrh" && (
              <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Nómina
              </Link>
            )}
            {rol === "user" && (
              <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Nómina
              </Link>
            )}
            <Link to="/miPerfil" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Mi Perfil
            </Link>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition ml-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-6 mt-16">
        <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-12">
          Bienvenido, {nombre} ({rol})
        </p>

        {/* Tarjetas para Admin y RRHH */}
        {(rol === "admin" || rol === "userrh") && (
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
        )}

        {/* Tarjeta de nóminas solo para User */}
        {rol === "user" && (
          <div className="card bg-white p-6 rounded-xl shadow-sm flex-1 min-w-[220px]">
            <h2>Nóminas Generadas</h2>
            <p className="text-4xl font-bold mt-3">{nominas}</p>
          </div>
        )}

        {/* Tabla de empleados solo para Admin */}
        {rol === "admin" && (
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
        )}
      </main>
    </div>
  );
}
