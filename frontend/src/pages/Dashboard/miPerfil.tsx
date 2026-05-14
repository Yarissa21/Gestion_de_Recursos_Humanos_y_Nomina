import { useEffect, useState } from "react";
import Header from "../../components/Header";

export default function MiPerfil() {
  const [documentos, setDocumentos] = useState([]);
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";

  useEffect(() => {
    fetch("http://localhost:3000/documentos")
      .then(res => res.json())
      .then(data => setDocumentos(data));
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-5xl mx-auto mt-12 bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Mi Perfil</h2>

        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Información del Usuario</h3>
          <p><strong>Nombre:</strong> {nombre}</p>
          <p><strong>Rol:</strong> <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{rol}</span></p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Subir Documento</h3>
          <div className="flex gap-4">
            <select className="border rounded-md px-3 py-2 w-64">
              <option>Seleccionar tipo de documento</option>
              <option>Certificado académico</option>
              <option>Expediente laboral</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Subir
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
