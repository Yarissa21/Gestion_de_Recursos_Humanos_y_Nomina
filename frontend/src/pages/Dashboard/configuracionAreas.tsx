import { useState } from "react";

export default function ConfiguracionAreas() {
  const [nombreArea, setNombreArea] = useState("");
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const opcionesDocumentos = [
    "DPI",
    "Antecedentes Penales",
    "Antecedentes Policiacos",
    "Primaria",
    "Básico",
    "Diversificado",
    "Universitario",
    "Maestría",
  ];

  const handleCheckboxChange = (doc: string) => {
    setDocumentos((prev) =>
      prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
    );
  };

  const handleCrearArea = async () => {
    if (!nombreArea.trim()) {
      alert("Por favor, ingresa el nombre del área.");
      return;
    }

    const nuevaArea = { nombre: nombreArea, documentos };
    setAreas([...areas, nuevaArea]);

    // Si tienes backend:
    // await fetch("http://localhost:3000/api/areas", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(nuevaArea),
    // });

    setNombreArea("");
    setDocumentos([]);
  };

  return (
    <div className="max-w-5xl mx-auto mt-12 bg-gray-50 min-h-screen text-gray-800 font-sans">
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-3">
        <span className="text-blue-600 text-3xl">⚙️</span> Configuración de Áreas
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Nueva Área</h2>

        <label className="block mb-2 font-medium">Nombre del Área</label>
        <input
          type="text"
          placeholder="Ej: Ventas, Contabilidad, IT..."
          value={nombreArea}
          onChange={(e) => setNombreArea(e.target.value)}
          className="border rounded-md w-full p-2 mb-6"
        />

        <h3 className="font-medium mb-3">Documentos Requeridos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {opcionesDocumentos.map((doc) => (
            <label
              key={doc}
              className="flex items-center gap-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={documentos.includes(doc)}
                onChange={() => handleCheckboxChange(doc)}
              />
              {doc}
            </label>
          ))}
        </div>

        <button
          onClick={handleCrearArea}
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
        >
          + Crear Área
        </button>
      </div>

      <div className="mt-10 text-center text-gray-500">
        {areas.length === 0 ? (
          <p>No hay áreas creadas</p>
        ) : (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Áreas creadas</h3>
            <ul className="list-disc pl-6 text-left">
              {areas.map((a, i) => (
                <li key={i}>
                  <strong>{a.nombre}</strong> — Documentos: {a.documentos.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
