import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Usuario {
  id_usuario: number;
  nombre: string;
}

interface DocExpediente {
  id_documento: number;
  nombre_documento: string;
  fecha_carga: string;
  archivo: string;
  tipo: { nombre: string };
  empleado: { nombre_empleado: string; apellido_empleado: string };
  usuario: Usuario;
  categoria: "expediente";
}

interface DocAcademico {
  id_doc_academico: number;
  nombre: string;
  fecha_carga: string;
  archivo: string;
  tipo_doc: { nombre: string };
  academico: { empleado: { nombre_empleado: string; apellido_empleado: string } };
  usuario: Usuario;
  categoria: "academico";
}

type Documento = (DocExpediente | DocAcademico) & { categoria: "expediente" | "academico" };

const getNombre = (doc: Documento) =>
  doc.categoria === "expediente"
    ? (doc as DocExpediente).nombre_documento
    : (doc as DocAcademico).nombre;

const getTipo = (doc: Documento) =>
  doc.categoria === "expediente"
    ? (doc as DocExpediente).tipo?.nombre || "—"
    : (doc as DocAcademico).tipo_doc?.nombre || "—";

const getEmpleado = (doc: Documento) => {
  const emp =
    doc.categoria === "expediente"
      ? (doc as DocExpediente).empleado
      : (doc as DocAcademico).academico?.empleado;
  return emp ? `${emp.nombre_empleado} ${emp.apellido_empleado}` : "—";
};

const getId = (doc: Documento) =>
  doc.categoria === "expediente"
    ? (doc as DocExpediente).id_documento
    : (doc as DocAcademico).id_doc_academico;

export default function Documentos() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<"todos" | "expediente" | "academico">("todos");
  const [filtroUsuario, setFiltroUsuario] = useState<number | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [previstaDoc, setPrevistaDoc] = useState<Documento | null>(null);
  const [editandoDoc, setEditandoDoc] = useState<Documento | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarDocumentos = () => {
    setLoading(true);
    Promise.all([
      fetchWithFallback("/expediente/documentos", { headers }).then((r) => r.json()),
      fetchWithFallback("/academicos/documentos", { headers }).then((r) => r.json()),
    ])
      .then(([exp, acad]) => {
        const expediente: Documento[] = Array.isArray(exp)
          ? exp.map((d: any) => ({ ...d, categoria: "expediente" as const }))
          : [];
        const academico: Documento[] = Array.isArray(acad)
          ? acad.map((d: any) => ({ ...d, categoria: "academico" as const }))
          : [];
        setDocumentos(
          [...expediente, ...academico].sort(
            (a, b) => new Date(b.fecha_carga).getTime() - new Date(a.fecha_carga).getTime()
          )
        );
      })
      .catch(() => setDocumentos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarDocumentos(); }, []);

  const usuarios: Usuario[] = Array.from(
    new Map(
      documentos
        .filter((d) => d.usuario?.id_usuario != null)
        .map((d) => [d.usuario.id_usuario, d.usuario] as [number, Usuario])
    ).values()
  );

  const docsFiltrados = documentos.filter((doc) => {
    if (filtroCategoria !== "todos" && doc.categoria !== filtroCategoria) return false;
    if (filtroUsuario !== "todos" && doc.usuario?.id_usuario !== filtroUsuario) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        getNombre(doc).toLowerCase().includes(q) ||
        getTipo(doc).toLowerCase().includes(q) ||
        getEmpleado(doc).toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getArchivoUrl = (doc: Documento) => {
    const id = getId(doc);
    return doc.categoria === "expediente"
      ? `/expediente/documento/${id}/archivo`
      : `/academicos/documento/${id}/archivo`;
  };

  const handlePrevistar = (doc: Documento) => setPrevistaDoc(doc);

  const handleDescargar = async (doc: Documento) => {
    const url = getArchivoUrl(doc) + "?download=true";
    try {
      const LOCAL = "http://localhost:3000";
      const REMOTE = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";
      let fullUrl = `${LOCAL}${url}`;
      try {
        const test = await fetch(`${LOCAL}/departamentos`, { signal: AbortSignal.timeout(2000) });
        if (!test.ok) throw new Error();
      } catch {
        fullUrl = `${REMOTE}${url}`;
      }
      const a = document.createElement("a");
      a.href = fullUrl;
      a.download = getNombre(doc);
      a.click();
    } catch {
      alert("No se pudo descargar.");
    }
  };

  const handleEliminar = async (doc: Documento) => {
    if (!confirm(`¿Eliminar "${getNombre(doc)}"?`)) return;
    const id = getId(doc);
    try {
      doc.categoria === "expediente"
        ? await fetchWithFallback(`/expediente/documento/${id}`, { method: "DELETE", headers })
        : await fetchWithFallback(`/academicos/documento/${id}`, { method: "DELETE", headers });
      cargarDocumentos();
    } catch {
      alert("No se pudo eliminar.");
    }
  };

  const abrirEditar = (doc: Documento) => {
    setEditandoDoc(doc);
    setNuevoNombre(getNombre(doc));
    setNuevoArchivo(null);
  };

  const handleGuardarEdicion = async () => {
    if (!editandoDoc || !nuevoNombre.trim()) return;
    setGuardando(true);
    const id = getId(editandoDoc);
    try {
      const formData = new FormData();
      if (editandoDoc.categoria === "expediente") {
        formData.append("nombre_documento", nuevoNombre.trim());
      } else {
        formData.append("nombre", nuevoNombre.trim());
      }
      if (nuevoArchivo) {
        formData.append("file", nuevoArchivo);
      }

      const url = editandoDoc.categoria === "expediente"
        ? `/expediente/documento/${id}`
        : `/academicos/documento/${id}`;

      await fetchWithFallback(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setEditandoDoc(null);
      setNuevoArchivo(null);
      cargarDocumentos();
    } catch {
      alert("No se pudo actualizar.");
    } finally {
      setGuardando(false);
    }
  };

  const badgeCategoria = (cat: "expediente" | "academico") =>
    cat === "expediente"
      ? "bg-amber-100 text-amber-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-7xl mx-auto px-6 mt-10">

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h1 className="text-3xl font-bold">Documentos</h1>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, tipo, empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1">
            {(["todos", "expediente", "academico"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  filtroCategoria === cat
                    ? cat === "expediente" ? "bg-amber-100 text-amber-700 border-amber-300"
                      : cat === "academico" ? "bg-blue-100 text-blue-700 border-blue-300"
                      : "bg-gray-800 text-white border-gray-800"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat === "todos" ? "Todos" : cat === "expediente" ? "Expediente" : "Académicos"}
              </button>
            ))}
          </div>

          <select
            value={filtroUsuario}
            onChange={(e) => setFiltroUsuario(e.target.value === "todos" ? "todos" : Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
          >
            <option value="todos">Todos los usuarios</option>
            {usuarios.map((u) => (
              <option key={u.id_usuario} value={u.id_usuario}>{u.nombre}</option>
            ))}
          </select>

          <span className="text-sm text-gray-400 ml-auto">
            {docsFiltrados.length} documento{docsFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-center py-10">Cargando...</p>
          ) : docsFiltrados.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No hay documentos</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="p-4 text-left font-medium">Nombre</th>
                  <th className="p-4 text-left font-medium">Tipo</th>
                  <th className="p-4 text-left font-medium">Empleado</th>
                  <th className="p-4 text-left font-medium">Subido por</th>
                  <th className="p-4 text-left font-medium">Fecha</th>
                  <th className="p-4 text-left font-medium">Categoría</th>
                  <th className="p-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {docsFiltrados.map((doc) => (
                  <tr key={`${doc.categoria}-${getId(doc)}`} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4">
                      <span className="font-medium text-sm text-gray-800">{getNombre(doc)}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{getTipo(doc)}</td>
                    <td className="p-4 text-sm text-gray-600">{getEmpleado(doc)}</td>
                    <td className="p-4 text-sm text-gray-600">{doc.usuario?.nombre || "—"}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {doc.fecha_carga ? new Date(doc.fecha_carga).toLocaleDateString() : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeCategoria(doc.categoria)}`}>
                        {doc.categoria === "expediente" ? "Expediente" : "Académico"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handlePrevistar(doc)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Vista previa">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button onClick={() => handleDescargar(doc)} className="text-gray-400 hover:text-green-600 transition p-1.5 rounded-md hover:bg-green-50" title="Descargar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                        </button>
                        <button onClick={() => abrirEditar(doc)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button onClick={() => handleEliminar(doc)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal Vista Previa */}
      {previstaDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <p className="font-semibold text-sm">{getNombre(previstaDoc)}</p>
                <p className="text-xs text-gray-400">{getTipo(previstaDoc)} · {getEmpleado(previstaDoc)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDescargar(previstaDoc)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition px-3 py-1.5 rounded-md hover:bg-green-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar
                </button>
                <button onClick={() => setPrevistaDoc(null)} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`data:application/pdf;base64,${previstaDoc.archivo}`}
                className="w-full h-full rounded-b-xl"
                title="Vista previa"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editandoDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Editar Documento</h3>

            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuardarEdicion()}
              className="border border-gray-300 rounded-md w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reemplazar archivo
              <span className="text-gray-400 font-normal ml-1">(opcional)</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-md p-4 mb-6 text-center transition cursor-pointer ${nuevoArchivo ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => document.getElementById("input-archivo-editar")?.click()}
            >
              <input
                id="input-archivo-editar"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setNuevoArchivo(e.target.files?.[0] || null)}
              />
              {nuevoArchivo ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-blue-700 font-medium truncate">{nuevoArchivo.name}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setNuevoArchivo(null); }}
                    className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs">Click para seleccionar PDF</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardarEdicion}
                disabled={guardando || !nuevoNombre.trim()}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={() => { setEditandoDoc(null); setNuevoArchivo(null); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}