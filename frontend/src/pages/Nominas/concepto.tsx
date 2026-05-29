import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Concepto {
  id_concepto: number;
  nombre: string;
  tipo: string;
  porcentaje: number | null;
  monto_fijo: number | null;
  fecha_aplica: string | null;
}

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Error desconocido";
};

const tipoBadge = (tipo: string) => {
  const t = tipo.toLowerCase();
  if (t === "deduccion" || t === "descuento") return "bg-red-100 text-red-700";
  if (t === "bonificacion" || t === "comision") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-600";
};

const emptyForm = {
  nombre: "",
  tipo: "",
  porcentaje: "",
  monto_fijo: "",
  fecha_aplica: "",
};

const CACHE_KEY = "cache_conceptos";
const CACHE_TTL = 5 * 60 * 1000;

export default function ConceptosNomina() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const cargado = useRef(false);

  const [conceptos, setConceptos] = useState<Concepto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Concepto | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [errores, setErrores] = useState<Record<string, string>>({});

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const limpiarCache = () => sessionStorage.removeItem(CACHE_KEY);

  const cargar = async (forzar = false) => {
    if (!forzar) {
      const cache = sessionStorage.getItem(CACHE_KEY);
      if (cache) {
        const data = JSON.parse(cache);
        if (Date.now() < data._expires) {
          setConceptos(data.conceptos);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoading(true);
    fetchWithFallback("/conceptos", { headers })
      .then((r) => r.json())
      .then((d) => {
        const conceptos = Array.isArray(d) ? d : [];
        setConceptos(conceptos);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          conceptos,
        }));
      })
      .catch(() => setConceptos([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    cargar();
  }, []);

  const TIPOS_FIJOS = ["Bonificacion", "Comision", "Deduccion", "Descuento"];

  const conceptosFiltrados = conceptos.filter((c) => {
    if (filtroTipo !== "todos" && c.tipo.toLowerCase() !== filtroTipo.toLowerCase()) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return c.nombre.toLowerCase().includes(q) || c.tipo.toLowerCase().includes(q);
    }
    return true;
  });

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.tipo.trim()) e.tipo = "El tipo es obligatorio";
    const camposLlenos = [form.porcentaje.trim(), form.monto_fijo.trim(), form.fecha_aplica.trim()].filter(Boolean).length;
    if (camposLlenos > 1) {
      e.porcentaje = "Solo puedes usar uno: porcentaje, monto fijo o fecha de aplicación";
    } else {
      if (form.porcentaje && (isNaN(Number(form.porcentaje)) || Number(form.porcentaje) < 0)) {
        e.porcentaje = "Debe ser un número positivo";
      }
      if (form.monto_fijo && (isNaN(Number(form.monto_fijo)) || Number(form.monto_fijo) < 0)) {
        e.monto_fijo = "Debe ser un número positivo";
      }
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const setField = (field: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errores[field]) {
      setErrores((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(emptyForm);
    setErrores({});
    setErrorGlobal("");
    setMostrarModal(true);
  };

  const abrirEditar = (c: Concepto) => {
    setEditando(c);
    setForm({
      nombre: c.nombre,
      tipo: c.tipo,
      porcentaje: c.porcentaje != null ? String(c.porcentaje) : "",
      monto_fijo: c.monto_fijo != null ? String(c.monto_fijo) : "",
      fecha_aplica: c.fecha_aplica ? c.fecha_aplica.split("T")[0] : "",
    });
    setErrores({});
    setErrorGlobal("");
    setMostrarModal(true);
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    setErrorGlobal("");
    try {
      const body: any = {
        nombre: form.nombre.trim(),
        tipo: form.tipo.trim(),
      };
      if (form.porcentaje.trim()) body.porcentaje = Number(form.porcentaje);
      if (form.monto_fijo.trim()) body.monto_fijo = Number(form.monto_fijo);
      if (form.fecha_aplica.trim()) body.fecha_aplica = `${form.fecha_aplica}T12:00:00.000Z`;

      const res = editando
        ? await fetchWithFallback(`/conceptos/${editando.id_concepto}`, { method: "PUT", headers, body: JSON.stringify(body) })
        : await fetchWithFallback("/conceptos", { method: "POST", headers, body: JSON.stringify(body) });

      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setMostrarModal(false);
      limpiarCache();
      cargar(true);
    } catch (e: any) {
      setErrorGlobal(e.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (c: Concepto) => {
    if (!confirm(`¿Eliminar concepto "${c.nombre}"?`)) return;
    try {
      const res = await fetchWithFallback(`/conceptos/${c.id_concepto}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      limpiarCache();
      cargar(true);
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar.");
    }
  };

  const inputClass = (error?: string) =>
    `border rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400" : "border-gray-300"}`;

  const hayOtroCampo = (campo: "porcentaje" | "monto_fijo" | "fecha_aplica") => {
    const otros = { porcentaje: ["monto_fijo", "fecha_aplica"], monto_fijo: ["porcentaje", "fecha_aplica"], fecha_aplica: ["porcentaje", "monto_fijo"] };
    return otros[campo].some((c) => form[c as keyof typeof emptyForm].trim() !== "");
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-5xl mx-auto px-6 mt-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              <h1 className="text-3xl font-bold">Conceptos de Nómina</h1>
            </div>
            <button onClick={abrirCrear} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Concepto
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total conceptos</p>
              <p className="text-3xl font-bold text-gray-800">{conceptos.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
              <p className="text-xs text-gray-400 mb-1">Bonificaciones / Comisiones</p>
              <p className="text-3xl font-bold text-green-600">
                {conceptos.filter((c) => { const t = c.tipo.toLowerCase(); return t === "bonificacion" || t === "comision"; }).length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4 border border-red-100">
              <p className="text-xs text-gray-400 mb-1">Deducciones / Descuentos</p>
              <p className="text-3xl font-bold text-red-600">
                {conceptos.filter((c) => { const t = c.tipo.toLowerCase(); return t === "deduccion" || t === "descuento"; }).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Buscar por nombre o tipo..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              <button onClick={() => setFiltroTipo("todos")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${filtroTipo === "todos" ? "bg-gray-800 text-white border-gray-800" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                Todos
              </button>
              {TIPOS_FIJOS.map((t) => (
                <button key={t} onClick={() => setFiltroTipo(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    filtroTipo === t ? tipoBadge(t) + " border-current" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {conceptosFiltrados.length} concepto{conceptosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {conceptosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">No hay conceptos registrados</p>
                <button onClick={abrirCrear} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear primer concepto
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="p-4 text-left font-medium">Nombre</th>
                    <th className="p-4 text-left font-medium">Tipo</th>
                    <th className="p-4 text-left font-medium">Porcentaje</th>
                    <th className="p-4 text-left font-medium">Monto Fijo</th>
                    <th className="p-4 text-left font-medium">Fecha Aplica</th>
                    <th className="p-4 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {conceptosFiltrados.map((c) => (
                    <tr key={c.id_concepto} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-sm">{c.nombre}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tipoBadge(c.tipo)}`}>{c.tipo}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {c.porcentaje != null ? `${c.porcentaje}%` : "—"}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {c.monto_fijo != null ? `Q ${c.monto_fijo.toLocaleString("es-GT", { minimumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {c.fecha_aplica ? new Date(c.fecha_aplica).toLocaleDateString("es-GT") : "—"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => abrirEditar(c)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEliminar(c)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
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
      )}

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editando ? "Editar Concepto" : "Nuevo Concepto"}</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {errorGlobal && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorGlobal}</div>
            )}

            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" placeholder="Ej: IGSS, Bonificación Incentivo..."
                  value={form.nombre} onChange={(e) => setField("nombre", e.target.value)}
                  className={inputClass(errores.nombre)}
                />
                {errores.nombre && <p className="text-xs text-red-500 mt-0.5">{errores.nombre}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={form.tipo} onChange={(e) => setField("tipo", e.target.value)}
                  className={inputClass(errores.tipo)}
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Bonificacion">Bonificación</option>
                  <option value="Comision">Comisión</option>
                  <option value="Deduccion">Deducción</option>
                  <option value="Descuento">Descuento</option>
                </select>
                {errores.tipo && <p className="text-xs text-red-500 mt-0.5">{errores.tipo}</p>}
              </div>

              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-400 mb-3">Selecciona solo uno de los siguientes</p>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porcentaje <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                    </label>
                    <div className="relative">
                      <input type="number" placeholder="0" min="0" step="0.01"
                        value={form.porcentaje}
                        onChange={(e) => setField("porcentaje", e.target.value)}
                        disabled={hayOtroCampo("porcentaje")}
                        className={inputClass(errores.porcentaje) + " pr-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100"}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">%</span>
                    </div>
                    {errores.porcentaje && <p className="text-xs text-red-500 mt-0.5">{errores.porcentaje}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">ó</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto Fijo <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">Q</span>
                      <input type="number" placeholder="0.00" min="0" step="0.01"
                        value={form.monto_fijo}
                        onChange={(e) => setField("monto_fijo", e.target.value)}
                        disabled={hayOtroCampo("monto_fijo")}
                        className={inputClass(errores.monto_fijo) + " pl-8 disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100"}
                      />
                    </div>
                    {errores.monto_fijo && <p className="text-xs text-red-500 mt-0.5">{errores.monto_fijo}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">ó</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Aplicación <span className="text-gray-400 font-normal ml-1">(opcional)</span>
                    </label>
                    <input type="date"
                      value={form.fecha_aplica}
                      onChange={(e) => setField("fecha_aplica", e.target.value)}
                      disabled={hayOtroCampo("fecha_aplica")}
                      className={inputClass(errores.fecha_aplica) + " disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-100"}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardando ? "Guardando..." : editando ? "Actualizar" : "Crear Concepto"}
              </button>
              <button onClick={() => setMostrarModal(false)}
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