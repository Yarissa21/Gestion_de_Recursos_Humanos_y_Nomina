import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin, isAdminOrRH } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

interface TipoDocumento {
  id_tipo: number;
  nombre: string;
  obligatorio: boolean;
}

interface DocumentoExpediente {
  id_documento: number;
  nombre_documento: string;
  fecha_carga: string;
  id_tipo: number;
  tipo: { nombre: string };
}

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Error desconocido";
};

const CACHE_KEY = "cache_expediente_base";
const CACHE_TTL = 5 * 60 * 1000;

export default function Expediente() {
  if (!isAdminOrRH()) return <Navigate to="/dashboard" replace />;

  const cargado = useRef(false);

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocumento[]>([]);
  const [loading, setLoading] = useState(true);
  const [empSeleccionado, setEmpSeleccionado] = useState<Empleado | null>(null);
  const [docs, setDocs] = useState<DocumentoExpediente[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [modalDoc, setModalDoc] = useState<{ modo: "crear" | "editar"; doc?: DocumentoExpediente; tipoId?: number } | null>(null);
  const [archivoDoc, setArchivoDoc] = useState<File | null>(null);
  const [nuevoNombreDoc, setNuevoNombreDoc] = useState("");
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorDoc, setErrorDoc] = useState("");

  const [previstaDoc, setPrevistaDoc] = useState<DocumentoExpediente | null>(null);
  const [archivoPrevia, setArchivoPrevia] = useState<string | null>(null);
  const [cargandoPrevia, setCargandoPrevia] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const id_usuario = localStorage.getItem("id_usuario") || "1";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const LOCAL = "http://localhost:3000";
  const REMOTE = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

  const getBase = async () => {
    try {
      await fetch(`${LOCAL}/health`, { signal: AbortSignal.timeout(2000) });
      return LOCAL;
    } catch { return REMOTE; }
  };

  const cargarDatos = async (forzar = false) => {
    if (!forzar) {
      const cache = sessionStorage.getItem(CACHE_KEY);
      if (cache) {
        const data = JSON.parse(cache);
        if (Date.now() < data._expires) {
          setEmpleados(data.empleados);
          setTiposDoc(data.tiposDoc);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoading(true);
    Promise.all([
      fetchWithFallback("/empleados", { headers }).then((r) => r.json()),
      fetchWithFallback("/expediente/tipos", { headers }).then((r) => r.json()),
    ])
      .then(([emps, tipos]) => {
        const empleados = Array.isArray(emps) ? emps : [];
        const tiposDoc = Array.isArray(tipos) ? tipos : [];
        setEmpleados(empleados);
        setTiposDoc(tiposDoc);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          empleados, tiposDoc,
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    cargarDatos();
  }, []);

  const cargarDocs = async (id_empleado: number) => {
    setLoadingDocs(true);
    try {
      const res = await fetchWithFallback(`/expediente/documentos/empleado/${id_empleado}`, { headers });
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
    } catch { setDocs([]); }
    finally { setLoadingDocs(false); }
  };

  const seleccionarEmp = async (emp: Empleado) => {
    setEmpSeleccionado(emp);
    await cargarDocs(emp.id_empleado);
  };

  const abrirSubir = (tipoId: number) => {
    setModalDoc({ modo: "crear", tipoId });
    setArchivoDoc(null);
    setErrorDoc("");
  };

  const abrirEditar = (doc: DocumentoExpediente) => {
    setModalDoc({ modo: "editar", doc });
    setArchivoDoc(null);
    setNuevoNombreDoc(doc.nombre_documento);
    setErrorDoc("");
  };

  const handleGuardarDoc = async () => {
    if (!empSeleccionado) return;
    if (modalDoc?.modo === "crear") {
      if (!archivoDoc || !modalDoc.tipoId) { setErrorDoc("Selecciona un archivo."); return; }
      setSubiendoDoc(true);
      setErrorDoc("");
      try {
        const fd = new FormData();
        fd.append("file", archivoDoc);
        fd.append("id_tipo", String(modalDoc.tipoId));
        fd.append("id_empleado", String(empSeleccionado.id_empleado));
        fd.append("id_usuario", id_usuario);
        const res = await fetchWithFallback("/expediente/documento", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
        setModalDoc(null);
        await cargarDocs(empSeleccionado.id_empleado);
      } catch (e: any) { setErrorDoc(e.message || "No se pudo subir."); }
      finally { setSubiendoDoc(false); }
    } else if (modalDoc?.modo === "editar" && modalDoc.doc) {
      if (!nuevoNombreDoc.trim()) { setErrorDoc("El nombre es obligatorio."); return; }
      setSubiendoDoc(true);
      setErrorDoc("");
      try {
        const base = nuevoNombreDoc.trim().toLowerCase().endsWith(".pdf")
          ? nuevoNombreDoc.trim().slice(0, -4)
          : nuevoNombreDoc.trim();
        const nombreFinal = `${base}.pdf`;
        const fd = new FormData();
        fd.append("nombre_documento", nombreFinal);
        if (archivoDoc) fd.append("file", archivoDoc);
        const res = await fetchWithFallback(`/expediente/documento/${modalDoc.doc.id_documento}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
        setModalDoc(null);
        await cargarDocs(empSeleccionado.id_empleado);
      } catch (e: any) { setErrorDoc(e.message || "No se pudo actualizar."); }
      finally { setSubiendoDoc(false); }
    }
  };

  const handleEliminar = async (doc: DocumentoExpediente) => {
    if (!confirm(`¿Eliminar "${doc.nombre_documento}"?`)) return;
    try {
      await fetchWithFallback(`/expediente/documento/${doc.id_documento}`, { method: "DELETE", headers });
      if (empSeleccionado) await cargarDocs(empSeleccionado.id_empleado);
    } catch { alert("No se pudo eliminar."); }
  };

  const handleDescargar = async (doc: DocumentoExpediente) => {
    const base = await getBase();
    const a = document.createElement("a");
    a.href = `${base}/expediente/documento/${doc.id_documento}/archivo?download=true`;
    a.download = doc.nombre_documento;
    a.click();
  };

  const abrirPrevia = async (doc: DocumentoExpediente) => {
    setPrevistaDoc(doc);
    setArchivoPrevia(null);
    setCargandoPrevia(true);
    try {
      const base = await getBase();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(`${base}/expediente/documento/${doc.id_documento}/archivo`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const blob = await res.blob();
      setArchivoPrevia(URL.createObjectURL(blob));
    } catch {
      setArchivoPrevia("error");
    } finally {
      setCargandoPrevia(false);
    }
  };

  const cerrarPrevia = () => {
    if (archivoPrevia && archivoPrevia !== "error") URL.revokeObjectURL(archivoPrevia);
    setPrevistaDoc(null);
    setArchivoPrevia(null);
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return emp.nombre_empleado.toLowerCase().includes(q) || emp.apellido_empleado.toLowerCase().includes(q);
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">
          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            <h1 className="text-3xl font-bold">Expediente de Empleados</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Seleccionar Empleado</h2>
              <div className="relative mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" placeholder="Buscar empleado..."
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <ul className="divide-y max-h-[60vh] overflow-y-auto">
                {empleadosFiltrados.map((emp) => (
                  <li key={emp.id_empleado}>
                    <button
                      onClick={() => seleccionarEmp(emp)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition text-sm ${empSeleccionado?.id_empleado === emp.id_empleado ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {emp.nombre_empleado} {emp.apellido_empleado}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-4">
              {!empSeleccionado ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-sm">Selecciona un empleado para ver su expediente</p>
                </div>
              ) : (
                <>
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">
                    Expediente de {empSeleccionado.nombre_empleado} {empSeleccionado.apellido_empleado}
                  </h2>
                  {loadingDocs ? (
                    <p className="text-gray-400 text-sm text-center py-6">Cargando documentos...</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {tiposDoc.map((tipo) => {
                        const docExistente = docs.find((d) => d.id_tipo === tipo.id_tipo);
                        return (
                          <div key={tipo.id_tipo}
                            className={`flex items-center justify-between border rounded-lg px-4 py-3 ${docExistente ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${docExistente ? "bg-green-400" : "bg-gray-300"}`} />
                              <div>
                                <p className="text-sm font-medium text-gray-800">{tipo.nombre}</p>
                                {docExistente && (
                                  <p className="text-xs text-gray-500">{docExistente.nombre_documento} · {new Date(docExistente.fecha_carga).toLocaleDateString("es-GT")}</p>
                                )}
                              </div>
                              {tipo.obligatorio && <span className="text-xs text-red-500 font-medium ml-2">Req.</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              {docExistente ? (
                                <>
                                  <button onClick={() => abrirPrevia(docExistente)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Ver">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                    </svg>
                                  </button>
                                  <button onClick={() => handleDescargar(docExistente)} className="text-gray-400 hover:text-green-600 transition p-1.5 rounded-md hover:bg-green-50" title="Descargar">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                      <polyline points="7 10 12 15 17 10" />
                                      <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                  </button>
                                  <button onClick={() => abrirEditar(docExistente)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>
                                  {isAdmin() && (
                                    <button onClick={() => handleEliminar(docExistente)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                        <path d="M10 11v6" /><path d="M14 11v6" />
                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                      </svg>
                                    </button>
                                  )}
                                </>
                              ) : (
                                <button onClick={() => abrirSubir(tipo.id_tipo)}
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                                  </svg>
                                  Subir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      )}

      {modalDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{modalDoc.modo === "crear" ? "Subir Documento" : "Editar Documento"}</h3>
              <button onClick={() => setModalDoc(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {errorDoc && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorDoc}</div>}
            {modalDoc.modo === "editar" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={nuevoNombreDoc}
                  onChange={(e) => setNuevoNombreDoc(e.target.value)}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">Se agregará .pdf automáticamente si no lo incluyes</p>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modalDoc.modo === "crear" ? "Archivo PDF" : "Reemplazar archivo (opcional)"}
            </label>
            <div
              className={`border-2 border-dashed rounded-md p-4 mb-5 text-center cursor-pointer transition ${archivoDoc ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => document.getElementById("input-exp-doc")?.click()}
            >
              <input id="input-exp-doc" type="file" accept=".pdf" className="hidden"
                onChange={(e) => setArchivoDoc(e.target.files?.[0] || null)}
              />
              {archivoDoc ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-blue-700 font-medium truncate">{archivoDoc.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setArchivoDoc(null); }} className="text-gray-400 hover:text-red-500">
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
              <button onClick={handleGuardarDoc} disabled={subiendoDoc}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {subiendoDoc ? "Guardando..." : modalDoc.modo === "crear" ? "Subir" : "Guardar"}
              </button>
              <button onClick={() => setModalDoc(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {previstaDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <p className="font-semibold text-sm">{previstaDoc.nombre_documento}</p>
                <p className="text-xs text-gray-400">{previstaDoc.tipo?.nombre}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleDescargar(previstaDoc)}
                  className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium transition px-3 py-1.5 rounded-md hover:bg-green-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar
                </button>
                <button onClick={cerrarPrevia} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              {cargandoPrevia ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Cargando documento...</p>
                </div>
              ) : archivoPrevia === "error" ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">No se puede mostrar la vista previa de este archivo</p>
                  <p className="text-gray-400 text-xs">El archivo es muy grande o tardó demasiado en cargar</p>
                  <button onClick={() => previstaDoc && handleDescargar(previstaDoc)}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Descargar en su lugar
                  </button>
                </div>
              ) : archivoPrevia ? (
                <iframe src={archivoPrevia} className="w-full h-full rounded-b-xl" title="Vista previa" />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}