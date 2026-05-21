import { useState } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";

export default function ConfiguracionAreas() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const [nombreArea, setNombreArea] = useState("");
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";

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
    setNombreArea("");
    setDocumentos([]);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-5xl mx-auto px-6 mt-10">

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <h1 className="text-3xl font-bold">Configuración de Áreas</h1>
        </div>

        {/* Formulario nueva área */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Nueva Área</h2>

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Área
          </label>
          <input
            type="text"
            placeholder="Ej: Ventas, Contabilidad, IT..."
            value={nombreArea}
            onChange={(e) => setNombreArea(e.target.value)}
            className="border border-gray-300 rounded-md w-full p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Documentos Requeridos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {opcionesDocumentos.map((doc) => (
              <label
                key={doc}
                className={`flex items-center gap-2 border rounded-md p-3 cursor-pointer transition ${
                  documentos.includes(doc)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={documentos.includes(doc)}
                  onChange={() => handleCheckboxChange(doc)}
                  className="accent-blue-600"
                />
                <span className="text-sm">{doc}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleCrearArea}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear Área
          </button>
        </div>

        {/* Lista de áreas creadas */}
        {areas.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Áreas Creadas</h2>
            <ul className="divide-y">
              {areas.map((a, i) => (
                <li key={i} className="py-3">
                  <p className="font-medium">{a.nombre}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Documentos: {a.documentos.length > 0 ? a.documentos.join(", ") : "Ninguno"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {areas.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <p className="text-gray-400">No hay áreas creadas</p>
          </div>
        )}

      </main>
    </div>
  );
}