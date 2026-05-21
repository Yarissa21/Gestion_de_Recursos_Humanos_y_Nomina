import { useEffect, useState } from "react";
import Header from "../../components/Header";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

interface Nomina {
  id_nomina: number;
  periodo: string;
  tipo?: string;
  estado?: string;
}

export default function Dashboard() {
  const [usuarios, setUsuarios] = useState(0);
  const [nominas, setNominas] = useState(0);
  const [nominasList, setNominasList] = useState<Nomina[]>([]);
  const [areas, setAreas] = useState(0);
  const [documentos, setDocumentos] = useState(0);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const rolDisplay = rol.toUpperCase();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    if (rol === "admin" || rol === "userrh" || rol === "usuariorh") {
      fetch("http://localhost:3000/api/usuarios", { headers })
        .then(res => res.json())
        .then(data => setUsuarios(data.total))
        .catch(() => setUsuarios(0));

      fetch("http://localhost:3000/nomina", { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNominas(data.length);
            setNominasList(data.slice(0, 3)); // últimas 3
          }
        })
        .catch(() => setNominas(0));

      setAreas(0);
      setDocumentos(0);
    }

    if (rol === "admin") {
      fetch("http://localhost:3000/empleados", { headers })
        .then(res => res.json())
        .then(data => setEmpleados(Array.isArray(data) ? data : []))
        .catch(() => setEmpleados([]));
    }

    if (rol === "user") {
      fetch("http://localhost:3000/nomina", { headers })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setNominas(data.length);
            setNominasList(data.slice(0, 3));
          }
        })
        .catch(() => setNominas(0));
    }
  }, [rol]);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-7xl mx-auto px-6 mt-10">
        <h1 className="text-4xl font-bold mb-1">Dashboard de Recursos Humanos</h1>
        <p className="text-gray-500 mb-10">Bienvenido, {nombre} ({rolDisplay})</p>

        {/* Cards para Admin y RH */}
        {(rol === "admin" || rol === "userrh" || rol === "usuariorh") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            {/* Total Usuarios */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Total Usuarios</p>
                <p className="text-4xl font-bold">{usuarios}</p>
                <p className="text-gray-400 text-sm mt-2">Empleados: {empleados.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>

            {/* Nóminas Generadas */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Nóminas Generadas</p>
                <p className="text-4xl font-bold">{nominas}</p>
                <p className="text-gray-400 text-sm mt-2">Gestión de pagos</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>

            {/* Áreas */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Áreas</p>
                <p className="text-4xl font-bold">{areas}</p>
                <p className="text-gray-400 text-sm mt-2">Configuradas en el sistema</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </div>
            </div>

            {/* Documentos */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm mb-1">Documentos</p>
                <p className="text-4xl font-bold">{documentos}</p>
                <p className="text-gray-400 text-sm mt-2">Subidos al sistema</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Card solo para User */}
        {rol === "user" && (
          <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start max-w-sm mb-10">
            <div>
              <p className="text-gray-500 text-sm mb-1">Mis Nóminas</p>
              <p className="text-4xl font-bold">{nominas}</p>
              <p className="text-gray-400 text-sm mt-2">Nóminas registradas</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
        )}

        {/* Secciones inferiores - Admin y RH */}
        {(rol === "admin" || rol === "userrh" || rol === "usuariorh") && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Últimas Nóminas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Últimas Nóminas</h3>
              {nominasList.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No hay nóminas generadas</p>
              ) : (
                <ul className="divide-y">
                  {nominasList.map(n => (
                    <li key={n.id_nomina} className="py-3 flex justify-between">
                      <span className="font-medium">{n.periodo}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        n.estado === "Procesada"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {n.estado}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Áreas Configuradas */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Áreas Configuradas</h3>
              <p className="text-gray-400 text-center py-4">No hay áreas configuradas</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}