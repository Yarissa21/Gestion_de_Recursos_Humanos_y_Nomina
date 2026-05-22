import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { fetchWithFallback } from "../../utils/api";

export default function MiPerfil() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [tipoDocumento, setTipoDocumento] = useState("");

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const rolDisplay = rol.toUpperCase();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetchWithFallback("/documentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDocumentos(Array.isArray(data) ? data : []))
      .catch(() => setDocumentos([]));
  }, []);

  const handleSubir = () => {
    if (!tipoDocumento) {
      alert("Por favor selecciona un tipo de documento.");
      return;
    }
    alert(`Subiendo: ${tipoDocumento} — funcionalidad pendiente de backend.`);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-4xl mx-auto px-6 mt-10">
        <div className="flex items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Información del Usuario</h2>
          <p className="mb-2">
            <span className="font-medium">Nombre:</span> {nombre}
          </p>
          <p className="flex items-center gap-2">
            <span className="font-medium">Rol:</span>
            <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
              {rolDisplay}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Subir Documento</h2>
          <div className="flex gap-4 items-center">
            <select
              value={tipoDocumento}
              onChange={(e) => setTipoDocumento(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 flex-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo de documento</option>
              <option value="DPI">DPI</option>
              <option value="Antecedentes Penales">Antecedentes Penales</option>
              <option value="Antecedentes Policiacos">Antecedentes Policiacos</option>
              <option value="Primaria">Primaria</option>
              <option value="Básico">Básico</option>
              <option value="Diversificado">Diversificado</option>
              <option value="Universitario">Universitario</option>
              <option value="Maestría">Maestría</option>
            </select>
            <button
              onClick={handleSubir}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Subir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Mis Documentos</h2>
          {documentos.length === 0 ? (
            <p className="text-gray-400 text-center py-6">No has subido documentos</p>
          ) : (
            <ul className="divide-y">
              {documentos.map((doc: any, i: number) => (
                <li key={i} className="py-3 flex justify-between items-center">
                  <span>{doc.nombre || doc.tipo || "Documento"}</span>
                  <span className="text-sm text-gray-400">{doc.fecha || ""}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}