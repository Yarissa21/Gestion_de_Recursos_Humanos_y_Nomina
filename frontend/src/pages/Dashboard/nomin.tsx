import { useState, useEffect } from "react";

interface Nomina {
  id_nomina: number;
  periodo: string;
}

export default function Nomina() {
  const [periodo, setPeriodo] = useState("");
  const [nominas, setNominas] = useState<Nomina[]>([]);

  // Cargar nóminas existentes
  useEffect(() => {
    fetch("http://localhost:3000/nominas")
      .then(res => res.json())
      .then(data => setNominas(data))
      .catch(() => setNominas([]));
  }, []);

  // Crear nueva nómina
  const handleCrearNomina = async () => {
    if (!periodo.trim()) {
      alert("Por favor, ingresa el periodo de la nómina.");
      return;
    }

    const nuevaNomina = { periodo };

    try {
      const res = await fetch("http://localhost:3000/nominas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaNomina),
      });

      if (!res.ok) throw new Error("Error al crear la nómina");

      const data = await res.json();
      setNominas([...nominas, data]);
      setPeriodo("");
    } catch (error) {
      alert("No se pudo crear la nómina.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <span className="text-green-600 text-3xl">💲</span> Gestión de Nómina
      </h1>

      {/* Crear nueva nómina */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Generar Nueva Nómina</h2>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Periodo (Ej: Abril 2026)"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border rounded-md w-full p-2"
          />
          <button
            onClick={handleCrearNomina}
            className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition"
          >
            + Generar Nómina
          </button>
        </div>
      </div>

      {/* Lista de nóminas */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        {nominas.length === 0 ? (
          <p className="text-center text-gray-500">No hay nóminas generadas</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">ID</th>
                <th className="p-2 text-left">Periodo</th>
              </tr>
            </thead>
            <tbody>
              {nominas.map((n) => (
                <tr key={n.id_nomina} className="border-t">
                  <td className="p-2">{n.id_nomina}</td>
                  <td className="p-2">{n.periodo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
