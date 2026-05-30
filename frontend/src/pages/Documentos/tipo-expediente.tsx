import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface TipoDocumento {
  id_tipo: number;
  nombre: string;
  obligatorio: boolean;
}

interface TipoDocAcademico {
  id_tipo_doc_academico: number;
  nombre: string;
  obligatorio: boolean;
}

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Error desconocido";
};

type TabActiva = "expediente" | "academico";

const CACHE_KEY = "cache_tipos_documento";
const CACHE_TTL = 5 * 60 * 1000;

export default function TipoExpediente() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const cargado = useRef(false);
  const [tabActiva, setTabActiva] = useState<TabActiva>("expediente");

  const [tiposExp, setTiposExp] = useState<TipoDocumento[]>([]);
  const [loadingExp, setLoadingExp] = useState(true);
  const [mostrarModalExp, setMostrarModalExp] = useState(false);
  const [editandoExp, setEditandoExp] = useState<TipoDocumento | null>(null);
  const [formExp, setFormExp] = useState({ nombre: "", obligatorio: false });
  const [guardandoExp, setGuardandoExp] = useState(false);
  const [errorExp, setErrorExp] = useState("");

  const [tiposAcad, setTiposAcad] = useState<TipoDocAcademico[]>([]);
  const [loadingAcad, setLoadingAcad] = useState(true);
  const [mostrarModalAcad, setMostrarModalAcad] = useState(false);
  const [editandoAcad, setEditandoAcad] = useState<TipoDocAcademico | null>(null);
  const [formAcad, setFormAcad] = useState({ nombre: "", obligatorio: false });
  const [guardandoAcad, setGuardandoAcad] = useState(false);
  const [errorAcad, setErrorAcad] = useState("");

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const limpiarCache = () => {
    sessionStorage.removeItem(CACHE_KEY);       
    sessionStorage.removeItem("dashboard_cache");  
  };
  const cargarTodos = async (forzar = false) => {
    if (!forzar) {
      const cache = sessionStorage.getItem(CACHE_KEY);
      if (cache) {
        const data = JSON.parse(cache);
        if (Date.now() < data._expires) {
          setTiposExp(data.tiposExp);
          setTiposAcad(data.tiposAcad);
          setLoadingExp(false);
          setLoadingAcad(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoadingExp(true);
    setLoadingAcad(true);
    Promise.all([
      fetchWithFallback("/expediente/tipos", { headers }).then((r) => r.json()),
      fetchWithFallback("/tipos-documento-academico", { headers }).then((r) => r.json()),
    ])
      .then(([exp, acad]) => {
        const tiposExp = Array.isArray(exp) ? exp : [];
        const tiposAcad = Array.isArray(acad) ? acad : [];
        setTiposExp(tiposExp);
        setTiposAcad(tiposAcad);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          tiposExp, tiposAcad,
        }));
      })
      .catch(() => {})
      .finally(() => { setLoadingExp(false); setLoadingAcad(false); });
  };

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    cargarTodos();
  }, []);

  // ── Expediente CRUD ──
  const abrirCrearExp = () => { setEditandoExp(null); setFormExp({ nombre: "", obligatorio: false }); setErrorExp(""); setMostrarModalExp(true); };
  const abrirEditarExp = (tipo: TipoDocumento) => { setEditandoExp(tipo); setFormExp({ nombre: tipo.nombre, obligatorio: tipo.obligatorio }); setErrorExp(""); setMostrarModalExp(true); };

  const handleGuardarExp = async () => {
    if (!formExp.nombre.trim()) { setErrorExp("El nombre es obligatorio."); return; }
    setGuardandoExp(true);
    setErrorExp("");
    try {
      const body = { nombre: formExp.nombre.trim(), obligatorio: formExp.obligatorio };
      const res = editandoExp
        ? await fetchWithFallback(`/expediente/tipo/${editandoExp.id_tipo}`, { method: "PUT", headers, body: JSON.stringify(body) })
        : await fetchWithFallback("/expediente/tipo", { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setMostrarModalExp(false);
      limpiarCache();
      cargarTodos(true);
    } catch (e: any) { setErrorExp(e.message || "No se pudo guardar."); }
    finally { setGuardandoExp(false); }
  };

  const handleEliminarExp = async (tipo: TipoDocumento) => {
    if (!confirm(`¿Eliminar tipo "${tipo.nombre}"?`)) return;
    try {
      const res = await fetchWithFallback(`/expediente/tipo/${tipo.id_tipo}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      limpiarCache();
      cargarTodos(true);
    } catch (e: any) { alert(e.message || "No se pudo eliminar."); }
  };

  // ── Académico CRUD ──
  const abrirCrearAcad = () => { setEditandoAcad(null); setFormAcad({ nombre: "", obligatorio: false }); setErrorAcad(""); setMostrarModalAcad(true); };
  const abrirEditarAcad = (tipo: TipoDocAcademico) => { setEditandoAcad(tipo); setFormAcad({ nombre: tipo.nombre, obligatorio: tipo.obligatorio }); setErrorAcad(""); setMostrarModalAcad(true); };

  const handleGuardarAcad = async () => {
    if (!formAcad.nombre.trim()) { setErrorAcad("El nombre es obligatorio."); return; }
    setGuardandoAcad(true);
    setErrorAcad("");
    try {
      const body = { nombre: formAcad.nombre.trim(), obligatorio: formAcad.obligatorio };
      const res = editandoAcad
        ? await fetchWithFallback(`/tipos-documento-academico/${editandoAcad.id_tipo_doc_academico}`, { method: "PUT", headers, body: JSON.stringify(body) })
        : await fetchWithFallback("/tipos-documento-academico", { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setMostrarModalAcad(false);
      limpiarCache();
      cargarTodos(true);
    } catch (e: any) { setErrorAcad(e.message || "No se pudo guardar."); }
    finally { setGuardandoAcad(false); }
  };

  const handleEliminarAcad = async (tipo: TipoDocAcademico) => {
    if (!confirm(`¿Eliminar tipo "${tipo.nombre}"?`)) return;
    try {
      const res = await fetchWithFallback(`/tipos-documento-academico/${tipo.id_tipo_doc_academico}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      limpiarCache();
      cargarTodos(true);
    } catch (e: any) { alert(e.message || "No se pudo eliminar."); }
  };

  const TablaTipos = ({
    tipos, loading, onCrear, onEditar, onEliminar, colorBadge,
  }: {
    tipos: (TipoDocumento | TipoDocAcademico)[];
    loading: boolean;
    onCrear: () => void;
    onEditar: (t: any) => void;
    onEliminar: (t: any) => void;
    colorBadge: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {loading ? (
        <p className="text-gray-400 text-center py-10">Cargando...</p>
      ) : tipos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 mb-4">No hay tipos registrados</p>
          <button onClick={onCrear} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Crear primer tipo
          </button>
        </div>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="p-4 text-left font-medium">Nombre</th>
              <th className="p-4 text-left font-medium">Requerido</th>
              <th className="p-4 text-center font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tipos.map((tipo: any) => {
              const id = tipo.id_tipo ?? tipo.id_tipo_doc_academico;
              return (
                <tr key={id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full ${colorBadge}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                      {tipo.nombre}
                    </span>
                  </td>
                  <td className="p-4">
                    {tipo.obligatorio ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Obligatorio</span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">Opcional</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => onEditar(tipo)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => onEliminar(tipo)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
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
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );

  const ModalTipo = ({
    titulo, form, setForm, onGuardar, onCerrar, guardando, error,
  }: {
    titulo: string;
    form: { nombre: string; obligatorio: boolean };
    setForm: (f: any) => void;
    onGuardar: () => void;
    onCerrar: () => void;
    guardando: boolean;
    error: string;
  }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold">{titulo}</h3>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{error}</div>
        )}
        <div className="flex flex-col gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Constancia de trabajo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onGuardar()}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setForm({ ...form, obligatorio: !form.obligatorio })}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.obligatorio ? "bg-blue-600" : "bg-gray-200"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.obligatorio ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700">
              Documento obligatorio
              {form.obligatorio && <span className="ml-1 text-xs text-red-500 font-medium">(Req.)</span>}
            </span>
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={onGuardar} disabled={guardando}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button onClick={onCerrar}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-4xl mx-auto px-6 mt-10">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6" /><path d="M9 16h4" />
            </svg>
            <h1 className="text-3xl font-bold">Tipos de Documento</h1>
          </div>
          <button
            onClick={() => tabActiva === "expediente" ? abrirCrearExp() : abrirCrearAcad()}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Tipo
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 w-fit">
          <button
            onClick={() => setTabActiva("expediente")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tabActiva === "expediente" ? "bg-amber-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Expediente
          </button>
          <button
            onClick={() => setTabActiva("academico")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${tabActiva === "academico" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
          >
            Académico
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            className={`rounded-xl p-4 border cursor-pointer hover:shadow-md transition ${tabActiva === "expediente" ? "border-amber-200 bg-amber-50" : "border-gray-100 bg-white"}`}
            onClick={() => setTabActiva("expediente")}
          >
            <p className="text-xs text-gray-500 mb-1">Tipos de Expediente</p>
            <p className="text-3xl font-bold text-amber-600">{tiposExp.length}</p>
            <p className="text-xs text-gray-400 mt-1">{tiposExp.filter((t) => t.obligatorio).length} obligatorio{tiposExp.filter((t) => t.obligatorio).length !== 1 ? "s" : ""}</p>
          </div>
          <div
            className={`rounded-xl p-4 border cursor-pointer hover:shadow-md transition ${tabActiva === "academico" ? "border-blue-200 bg-blue-50" : "border-gray-100 bg-white"}`}
            onClick={() => setTabActiva("academico")}
          >
            <p className="text-xs text-gray-500 mb-1">Tipos Académicos</p>
            <p className="text-3xl font-bold text-blue-600">{tiposAcad.length}</p>
            <p className="text-xs text-gray-400 mt-1">{tiposAcad.filter((t) => t.obligatorio).length} obligatorio{tiposAcad.filter((t) => t.obligatorio).length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {tabActiva === "expediente" ? (
          <TablaTipos
            tipos={tiposExp}
            loading={loadingExp}
            onCrear={abrirCrearExp}
            onEditar={abrirEditarExp}
            onEliminar={handleEliminarExp}
            colorBadge="bg-amber-100 text-amber-700"
          />
        ) : (
          <TablaTipos
            tipos={tiposAcad}
            loading={loadingAcad}
            onCrear={abrirCrearAcad}
            onEditar={abrirEditarAcad}
            onEliminar={handleEliminarAcad}
            colorBadge="bg-blue-100 text-blue-700"
          />
        )}
      </main>

      {mostrarModalExp && (
        <ModalTipo
          titulo={editandoExp ? "Editar Tipo — Expediente" : "Nuevo Tipo — Expediente"}
          form={formExp}
          setForm={setFormExp}
          onGuardar={handleGuardarExp}
          onCerrar={() => setMostrarModalExp(false)}
          guardando={guardandoExp}
          error={errorExp}
        />
      )}

      {mostrarModalAcad && (
        <ModalTipo
          titulo={editandoAcad ? "Editar Tipo — Académico" : "Nuevo Tipo — Académico"}
          form={formAcad}
          setForm={setFormAcad}
          onGuardar={handleGuardarAcad}
          onCerrar={() => setMostrarModalAcad(false)}
          guardando={guardandoAcad}
          error={errorAcad}
        />
      )}
    </div>
  );
}