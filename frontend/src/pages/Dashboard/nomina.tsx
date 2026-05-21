import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { isAdmin, isRH, isUser } from "../../utils/auth";

interface Nomina {
  id_nomina: number;
  periodo: string;
  tipo?: string;
  estado?: string;
  fecha_creacion?: string;
}

export default function Nomina() {
  const [periodo, setPeriodo] = useState("");
  const [tipo, setTipo] = useState("Mensual");
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const nombre = localStorage.getItem("nombre") || "Usuario";

  useEffect(() => {
    if (!token) return;

    const url = isAdmin() || isRH()
      ? "http://localhost:3000/nomina"
      : "http://localhost:3000/nomina/mis-nominas";

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setNominas(Array.isArray(data) ? data : []))
      .catch(() => setNominas([]));
  }, [token]);

  const handleCrearNomina = async () => {
    if (!periodo.trim()) {
      alert("Por favor, ingresa el periodo de la nómina.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/nomina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ periodo, tipo }),
      });

      if (!res.ok) throw new Error("Error al crear la nómina");

      const data = await res.json();
      setNominas([...nominas, data]);
      setPeriodo("");
    } catch {
      alert("No se pudo crear la nómina.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-5xl mx-auto px-6 mt-10">

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <h1 className="text-3xl font-bold">Gestión de Nómina</h1>
        </div>

        {/* Formulario - solo admin y RH */}
        {(isAdmin() || isRH()) && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Generar Nueva Nómina</h2>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Periodo (Ej: Abril 2026)"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="border border-gray-300 rounded-md flex-1 p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Mensual">Mensual</option>
                <option value="Quincenal">Quincenal</option>
              </select>
              <button
                onClick={handleCrearNomina}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Generar Nómina
              </button>
            </div>
          </div>
        )}

        {/* Tabla de nóminas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          {nominas.length === 0 ? (
            <p className="text-center text-gray-400 py-6">
              {isUser() ? "No tienes nóminas registradas" : "No hay nóminas generadas"}
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-sm">
                  <th className="p-3 text-left font-medium">ID</th>
                  <th className="p-3 text-left font-medium">Periodo</th>
                  <th className="p-3 text-left font-medium">Tipo</th>
                  <th className="p-3 text-left font-medium">Estado</th>
                  <th className="p-3 text-left font-medium">Fecha Creación</th>
                </tr>
              </thead>
              <tbody>
                {nominas.map((n) => (
                  <tr key={n.id_nomina} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">{n.id_nomina}</td>
                    <td className="p-3 font-medium">{n.periodo}</td>
                    <td className="p-3">{n.tipo}</td>
                    <td className="p-3">
                      <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                        n.estado === "Procesada"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {n.estado}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {n.fecha_creacion
                        ? new Date(n.fecha_creacion).toLocaleString()
                        : ""}
                    </td>
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