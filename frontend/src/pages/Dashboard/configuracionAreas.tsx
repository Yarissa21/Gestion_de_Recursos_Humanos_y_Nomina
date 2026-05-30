import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
}

interface TipoDoc {
  id: number;
  nombre: string;
  obligatorio: boolean;
  categoria: "expediente" | "academico";
}

const docKey = (t: TipoDoc) => `${t.categoria}-${t.id}`;

type ModalMode = "crear" | "editar" | null;
interface ModalState {
  mode: ModalMode;
  categoria: "expediente" | "academico";
  id?: number;
  nombre: string;
  obligatorio: boolean;
}

export default function ConfiguracionAreas() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const navigate = useNavigate();

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");

  const [tiposExpediente, setTiposExpediente] = useState<TipoDoc[]>([]);
  const [tiposAcademico, setTiposAcademico] = useState<TipoDoc[]>([]);
  const [docsSeleccionados, setDocsSeleccionados] = useState<Set<string>>(new Set());
  const [loadingTipos, setLoadingTipos] = useState(true);

  const [modal, setModal] = useState<ModalState | null>(null);
  const [guardandoModal, setGuardandoModal] = useState(false);

  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [busquedaDep, setBusquedaDep] = useState("");
  const [nombreArea, setNombreArea] = useState("");
  const [guardando, setGuardando] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarDepartamentos = () => {
    setLoading(true);
    fetchWithFallback("/departamentos", { headers })
      .then((r) => r.json())
      .then((d) => setDepartamentos(Array.isArray(d) ? d : []))
      .catch(() => setDepartamentos([]))
      .finally(() => setLoading(false));
  };

  const cargarTipos = () => {
    setLoadingTipos(true);
    Promise.all([
      fetchWithFallback("/expediente/tipos", { headers }).then((r) => r.json()),
      fetchWithFallback("/tipos-documento-academico", { headers }).then((r) => r.json()),
    ])
      .then(([exp, acad]) => {
        setTiposExpediente(
          Array.isArray(exp)
            ? exp.map((t: any) => ({ id: t.id_tipo, nombre: t.nombre, obligatorio: t.obligatorio, categoria: "expediente" as const }))
            : []
        );
        setTiposAcademico(
          Array.isArray(acad)
            ? acad.map((t: any) => ({ id: t.id_tipo_doc_academico, nombre: t.nombre, obligatorio: t.obligatorio, categoria: "academico" as const }))
            : []
        );
      })
      .catch(() => {})
      .finally(() => setLoadingTipos(false));
  };

  useEffect(() => {
    cargarDepartamentos();
    cargarTipos();
  }, []);

  useEffect(() => {
    const obligatorios = new Set<string>();
    [...tiposExpediente, ...tiposAcademico]
      .filter((t) => t.obligatorio)
      .forEach((t) => obligatorios.add(docKey(t)));
    setDocsSeleccionados(obligatorios);
  }, [tiposExpediente, tiposAcademico]);

  const toggleDoc = (tipo: TipoDoc) => {
    if (tipo.obligatorio) return;
    const key = docKey(tipo);
    setDocsSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleCrearArea = async () => {
    if (!nombreArea.trim()) {
      alert("Por favor, ingresa el nombre del área.");
      return;
    }
    setGuardando(true);
    try {
      const res = await fetchWithFallback("/departamentos", {
        method: "POST",
        headers,
        body: JSON.stringify({ nombre_departamento: nombreArea.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "No se pudo crear el área.");
        return;
      }
      setNombreArea("");
      setMostrarFormulario(false);
      const obligatorios = new Set<string>();
      [...tiposExpediente, ...tiposAcademico]
        .filter((t) => t.obligatorio)
        .forEach((t) => obligatorios.add(docKey(t)));
      setDocsSeleccionados(obligatorios);
      sessionStorage.removeItem("cache_puestos");
      sessionStorage.removeItem("cache_empleados");
      cargarDepartamentos();
    } catch {
      alert("No se pudo crear el área.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar este departamento?")) return;
    try {
      const res = await fetchWithFallback(`/departamentos/${id}`, { method: "DELETE", headers });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "No se pudo eliminar.");
        return;
      }
      sessionStorage.removeItem("cache_puestos");
      sessionStorage.removeItem("cache_empleados");
      cargarDepartamentos();
    } catch {
      alert("No se pudo eliminar.");
    }
  };

  const handleEditarGuardar = async (id: number) => {
    if (!nombreEdicion.trim()) return;
    try {
      const res = await fetchWithFallback(`/departamentos/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ nombre_departamento: nombreEdicion.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "No se pudo actualizar.");
        return;
      }
      setEditandoId(null);
      setNombreEdicion("");
      sessionStorage.removeItem("cache_puestos");
      sessionStorage.removeItem("cache_empleados");
      cargarDepartamentos();
    } catch {
      alert("No se pudo actualizar.");
    }
  };

  const abrirCrear = (categoria: "expediente" | "academico") =>
    setModal({ mode: "crear", categoria, nombre: "", obligatorio: false });

  const abrirEditar = (tipo: TipoDoc) =>
    setModal({ mode: "editar", categoria: tipo.categoria, id: tipo.id, nombre: tipo.nombre, obligatorio: tipo.obligatorio });

  const cerrarModal = () => setModal(null);

  const handleGuardarTipo = async () => {
    if (!modal || !modal.nombre.trim()) return;
    setGuardandoModal(true);
    try {
      if (modal.categoria === "expediente") {
        modal.mode === "crear"
          ? await fetchWithFallback("/expediente/tipo", { method: "POST", headers, body: JSON.stringify({ nombre: modal.nombre.trim(), obligatorio: modal.obligatorio }) })
          : await fetchWithFallback(`/expediente/tipo/${modal.id}`, { method: "PUT", headers, body: JSON.stringify({ nombre: modal.nombre.trim(), obligatorio: modal.obligatorio }) });
      } else {
        modal.mode === "crear"
          ? await fetchWithFallback("/tipos-documento-academico", { method: "POST", headers, body: JSON.stringify({ nombre: modal.nombre.trim(), obligatorio: modal.obligatorio }) })
          : await fetchWithFallback(`/tipos-documento-academico/${modal.id}`, { method: "PUT", headers, body: JSON.stringify({ nombre: modal.nombre.trim(), obligatorio: modal.obligatorio }) });
      }
      cerrarModal();
      cargarTipos();
    } catch {
      alert("No se pudo guardar el tipo.");
    } finally {
      setGuardandoModal(false);
    }
  };

  const handleEliminarTipo = async (tipo: TipoDoc) => {
    if (!confirm(`¿Eliminar tipo "${tipo.nombre}"?`)) return;
    try {
      tipo.categoria === "expediente"
        ? await fetchWithFallback(`/expediente/tipo/${tipo.id}`, { method: "DELETE", headers })
        : await fetchWithFallback(`/tipos-documento-academico/${tipo.id}`, { method: "DELETE", headers });
      cargarTipos();
    } catch {
      alert("No se pudo eliminar el tipo.");
    }
  };

  const depColors = [
    { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
    { border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
    { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
    { border: "border-cyan-200", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-400" },
  ];

  const SeccionTipos = ({
    titulo, color, dotColor, tipos, categoria,
  }: {
    titulo: string; color: string; dotColor: string; tipos: TipoDoc[]; categoria: "expediente" | "academico";
  }) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${color}`}>
          <span className={`w-2 h-2 rounded-full ${dotColor}`} />
          {titulo}
        </p>
        <button
          onClick={() => abrirCrear(categoria)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo tipo
        </button>
      </div>
      {tipos.length === 0 ? (
        <p className="text-gray-400 text-xs italic">Sin tipos registrados</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tipos.map((tipo) => {
            const key = docKey(tipo);
            const seleccionado = docsSeleccionados.has(key);
            return (
              <div
                key={key}
                className={`flex items-center gap-2 border rounded-md px-3 py-2.5 transition ${seleccionado ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"} ${tipo.obligatorio ? "opacity-90" : "hover:bg-gray-50 cursor-pointer"}`}
                onClick={() => !tipo.obligatorio && toggleDoc(tipo)}
              >
                <input
                  type="checkbox"
                  checked={seleccionado}
                  disabled={tipo.obligatorio}
                  onChange={() => toggleDoc(tipo)}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-blue-600 shrink-0"
                />
                <span className="text-sm flex-1">{tipo.nombre}</span>
                {tipo.obligatorio && (
                  <span className="text-xs text-red-400 font-semibold shrink-0">Req.</span>
                )}
                <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => abrirEditar(tipo)} className="text-gray-300 hover:text-blue-500 transition p-0.5 rounded" title="Editar tipo">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button onClick={() => handleEliminarTipo(tipo)} className="text-gray-300 hover:text-red-500 transition p-0.5 rounded" title="Eliminar tipo">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-6xl mx-auto px-6 mt-10">

        {/* Título + botón Nuevo Departamento */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <h1 className="text-3xl font-bold">Configuración de Departamentos</h1>
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Departamento
          </button>
        </div>

        {/* Lista de departamentos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Departamentos</h2>
          {departamentos.length > 5 && (
            <div className="relative mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Buscar departamento..."
                value={busquedaDep} onChange={(e) => setBusquedaDep(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {loading ? (
            <p className="text-gray-400 text-center py-6">Cargando...</p>
          ) : departamentos.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">No hay departamentos creados</p>
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Crear primer departamento
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {departamentos
                .filter((dep) => !busquedaDep.trim() || dep.nombre_departamento.toLowerCase().includes(busquedaDep.toLowerCase()))
                .map((dep, i) => {
                const color = depColors[i % depColors.length];
                const estaEditando = editandoId === dep.id_departamento;
                return (
                  <li key={dep.id_departamento} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`} />
                      {estaEditando ? (
                        <input
                          type="text"
                          value={nombreEdicion}
                          onChange={(e) => setNombreEdicion(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleEditarGuardar(dep.id_departamento)}
                          className="border border-blue-400 rounded-md px-3 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span className={`text-sm font-medium ${color.text} ${color.bg} ${color.border} border px-3 py-1 rounded-full`}>
                          {dep.nombre_departamento}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {estaEditando ? (
                        <>
                          <button onClick={() => handleEditarGuardar(dep.id_departamento)} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition font-medium">Guardar</button>
                          <button onClick={() => { setEditandoId(null); setNombreEdicion(""); }} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-300 transition font-medium">Cancelar</button>
                        </>
                      ) : (
                        <>
                          {/* Ver puestos */}
                          <button
                            onClick={() => navigate(`/puestos?dep=${dep.id_departamento}&nombre=${encodeURIComponent(dep.nombre_departamento)}`)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition flex items-center gap-1"
                            title="Ver puestos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            Puestos
                          </button>
                          <button onClick={() => { setEditandoId(dep.id_departamento); setNombreEdicion(dep.nombre_departamento); }} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEliminar(dep.id_departamento)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" /><path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      {/* Modal Nuevo Departamento */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-4 py-10 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Nuevo Departamento</h2>
              <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Departamento</label>
            <input
              type="text"
              placeholder="Ej: Ventas, Contabilidad, IT..."
              value={nombreArea}
              onChange={(e) => setNombreArea(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCrearArea()}
              className="border border-gray-300 rounded-md w-full p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <h3 className="text-sm font-medium text-gray-700 mb-4">Documentos Requeridos</h3>

            {loadingTipos ? (
              <p className="text-gray-400 text-sm mb-6">Cargando tipos de documento...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <SeccionTipos titulo="Documentos de Expediente" color="text-amber-600" dotColor="bg-amber-400" tipos={tiposExpediente} categoria="expediente" />
                  <SeccionTipos titulo="Documentos Académicos" color="text-blue-600" dotColor="bg-blue-400" tipos={tiposAcademico} categoria="academico" />
                </div>
                {docsSeleccionados.size > 0 && (
                  <p className="text-xs text-blue-600 font-medium mb-4">
                    {docsSeleccionados.size} documento{docsSeleccionados.size > 1 ? "s" : ""} seleccionado{docsSeleccionados.size > 1 ? "s" : ""}
                  </p>
                )}
              </>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleCrearArea}
                disabled={guardando}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {guardando ? "Creando..." : "Crear Departamento"}
              </button>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal crear/editar tipo documento */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              {modal.mode === "crear" ? "Nuevo" : "Editar"} tipo —{" "}
              <span className={modal.categoria === "expediente" ? "text-amber-600" : "text-blue-600"}>
                {modal.categoria === "expediente" ? "Expediente" : "Académico"}
              </span>
            </h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={modal.nombre}
              onChange={(e) => setModal({ ...modal, nombre: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleGuardarTipo()}
              placeholder="Ej: Carta de Recomendación"
              className="border border-gray-300 rounded-md w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <label className="flex items-center gap-2 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={modal.obligatorio}
                onChange={(e) => setModal({ ...modal, obligatorio: e.target.checked })}
                className="accent-blue-600"
              />
              <span className="text-sm text-gray-700">Requerido obligatoriamente</span>
            </label>
            <div className="flex gap-3">
              <button onClick={handleGuardarTipo} disabled={guardandoModal || !modal.nombre.trim()} className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60">
                {guardandoModal ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={cerrarModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}