import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
}

interface Puesto {
  id_puesto: number;
  nombre_puesto: string;
  eliminado: boolean;
  departamento: Departamento;
}

function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  labelKey,
  valueKey,
  disabled = false,
}: {
  options: any[];
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder: string;
  labelKey: (o: any) => string;
  valueKey: (o: any) => number;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busq, setBusq] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const mostrarBusqueda = options.length > 5;

  const filtrados = busq.trim()
    ? options.filter((o) => labelKey(o).toLowerCase().includes(busq.toLowerCase()))
    : options;

  const seleccionado = options.find((o) => valueKey(o) === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setBusq("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => { if (!disabled) setOpen(!open); }}
        className={`w-full border rounded-md px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
        }`}
      >
        <span className="truncate">
          {seleccionado ? labelKey(seleccionado) : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {mostrarBusqueda && (
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus
                type="text"
                placeholder="Buscar..."
                value={busq}
                onChange={(e) => setBusq(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )}
          <ul className="max-h-48 overflow-y-auto py-1">
            <li
              onClick={() => { onChange(""); setOpen(false); setBusq(""); }}
              className="px-3 py-2 text-sm text-gray-400 hover:bg-gray-50 cursor-pointer"
            >
              {placeholder}
            </li>
            {filtrados.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">Sin resultados</li>
            ) : filtrados.map((o) => (
              <li
                key={valueKey(o)}
                onClick={() => { onChange(valueKey(o)); setOpen(false); setBusq(""); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 ${value === valueKey(o) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}`}
              >
                {labelKey(o)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const CACHE_KEY = "cache_puestos";
const CACHE_TTL = 5 * 60 * 1000;

export default function Puestos() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const depIdParam = searchParams.get("dep");
  const depNombreParam = searchParams.get("nombre") || "";
  const cargado = useRef(false);

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [depSeleccionado, setDepSeleccionado] = useState<number | "todos">(
    depIdParam ? Number(depIdParam) : "todos"
  );
  const [loading, setLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalEditar, setModalEditar] = useState<Puesto | null>(null);
  const [nombrePuesto, setNombrePuesto] = useState("");
  const [depPuesto, setDepPuesto] = useState<number | "">(depIdParam ? Number(depIdParam) : "");
  const [guardando, setGuardando] = useState(false);

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

  const cargarDatos = async (forzar = false) => {
    if (!forzar) {
      const cache = sessionStorage.getItem(CACHE_KEY);
      if (cache) {
        const data = JSON.parse(cache);
        if (Date.now() < data._expires) {
          setDepartamentos(data.departamentos);
          setPuestos(data.puestos);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoading(true);
    Promise.all([
      fetchWithFallback("/departamentos", { headers }).then((r) => r.json()),
      fetchWithFallback("/puestos", { headers }).then((r) => r.json()),
    ])
      .then(([deps, psts]) => {
        const departamentos = Array.isArray(deps) ? deps : [];
        const puestos = Array.isArray(psts) ? psts.filter((p: Puesto) => !p.eliminado) : [];
        setDepartamentos(departamentos);
        setPuestos(puestos);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          departamentos, puestos,
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

  const abrirCrear = () => {
    setModalEditar(null);
    setNombrePuesto("");
    setDepPuesto(depSeleccionado !== "todos" ? depSeleccionado : "");
    setMostrarModal(true);
  };

  const abrirEditar = (puesto: Puesto) => {
    setModalEditar(puesto);
    setNombrePuesto(puesto.nombre_puesto);
    setDepPuesto(puesto.departamento.id_departamento);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setModalEditar(null);
    setNombrePuesto("");
    setDepPuesto("");
  };

  const handleGuardar = async () => {
    if (!nombrePuesto.trim() || !depPuesto) {
      alert("Completa todos los campos.");
      return;
    }
    setGuardando(true);
    try {
      const res = modalEditar
        ? await fetchWithFallback(`/puestos/${modalEditar.id_puesto}`, {
            method: "PUT",
            headers,
            body: JSON.stringify({ nombre_puesto: nombrePuesto.trim(), id_departamento: depPuesto }),
          })
        : await fetchWithFallback("/puestos", {
            method: "POST",
            headers,
            body: JSON.stringify({ nombre_puesto: nombrePuesto.trim(), id_departamento: depPuesto }),
          });

      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "No se pudo guardar el puesto.");
        return;
      }

      cerrarModal();
      limpiarCache();
      cargarDatos(true);
    } catch {
      alert("No se pudo guardar el puesto.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm("¿Eliminar este puesto?")) return;
    try {
      const res = await fetchWithFallback(`/puestos/${id}`, { method: "DELETE", headers });
      if (!res.ok) {
        const err = await res.json();
        alert(err?.message || "No se pudo eliminar.");
        return;
      }
      limpiarCache();
      cargarDatos(true);
    } catch {
      alert("No se pudo eliminar.");
    }
  };

  const puestosFiltrados = depSeleccionado === "todos"
    ? puestos
    : puestos.filter((p) => p.departamento.id_departamento === depSeleccionado);

  const puestosPorDep = departamentos.reduce((acc, dep) => {
    const lista = puestosFiltrados.filter(
      (p) => p.departamento.id_departamento === dep.id_departamento
    );
    if (depSeleccionado === "todos" || dep.id_departamento === depSeleccionado) {
      acc[dep.id_departamento] = { dep, lista };
    }
    return acc;
  }, {} as Record<number, { dep: Departamento; lista: Puesto[] }>);

  const depColors = [
    { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", headerBg: "bg-blue-100", dot: "bg-blue-400" },
    { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", headerBg: "bg-emerald-100", dot: "bg-emerald-400" },
    { border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", headerBg: "bg-violet-100", dot: "bg-violet-400" },
    { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", headerBg: "bg-amber-100", dot: "bg-amber-400" },
    { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", headerBg: "bg-rose-100", dot: "bg-rose-400" },
    { border: "border-cyan-200", bg: "bg-cyan-50", text: "text-cyan-700", headerBg: "bg-cyan-100", dot: "bg-cyan-400" },
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-6xl mx-auto px-6 mt-10">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/configAreas")}
              className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"
              title="Volver"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
              </svg>
            </button>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <div>
              <h1 className="text-3xl font-bold">Puestos de Trabajo</h1>
              {depNombreParam && depSeleccionado !== "todos" && (
                <p className="text-sm text-gray-500">{decodeURIComponent(depNombreParam)}</p>
              )}
            </div>
          </div>
          <button
            onClick={abrirCrear}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nuevo Puesto
          </button>
        </div>

        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setDepSeleccionado("todos")}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              depSeleccionado === "todos"
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            Todos
          </button>
          {departamentos.map((dep, i) => {
            const color = depColors[i % depColors.length];
            const activo = depSeleccionado === dep.id_departamento;
            return (
              <button
                key={dep.id_departamento}
                onClick={() => setDepSeleccionado(dep.id_departamento)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                  activo ? `${color.bg} ${color.text} ${color.border}` : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {dep.nombre_departamento}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-10">Cargando...</p>
        ) : Object.keys(puestosPorDep).length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center">
            <p className="text-gray-400 mb-4">No hay puestos registrados</p>
            <button
              onClick={abrirCrear}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primer puesto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(puestosPorDep).map(({ dep, lista }) => {
              const color = depColors[
                departamentos.findIndex((d) => d.id_departamento === dep.id_departamento) % depColors.length
              ];
              return (
                <div key={dep.id_departamento} className={`bg-white rounded-xl shadow-sm overflow-hidden border ${color.border}`}>
                  <div className={`${color.headerBg} px-5 py-3 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                      <span className={`font-semibold text-sm ${color.text}`}>{dep.nombre_departamento}</span>
                      <span className={`text-xs ${color.text} opacity-70`}>({lista.length} puesto{lista.length !== 1 ? "s" : ""})</span>
                    </div>
                    <button
                      onClick={() => {
                        setModalEditar(null);
                        setNombrePuesto("");
                        setDepPuesto(dep.id_departamento);
                        setMostrarModal(true);
                      }}
                      className={`text-xs ${color.text} hover:opacity-80 font-medium flex items-center gap-1 transition`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Agregar
                    </button>
                  </div>

                  {lista.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-6">Sin puestos en este departamento</p>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {lista.map((puesto) => (
                        <li key={puesto.id_puesto} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">{puesto.nombre_puesto}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => abrirEditar(puesto)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Editar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button onClick={() => handleEliminar(puesto.id_puesto)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{modalEditar ? "Editar Puesto" : "Nuevo Puesto"}</h3>
              <button onClick={cerrarModal} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Puesto</label>
            <input
              type="text"
              value={nombrePuesto}
              onChange={(e) => setNombrePuesto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuardar()}
              placeholder="Ej: Gerente, Analista, Coordinador..."
              className="border border-gray-300 rounded-md w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <div className="mb-6">
              <SearchSelect
                options={departamentos}
                value={depPuesto}
                onChange={(v) => setDepPuesto(v === "" ? "" : Number(v))}
                placeholder="Seleccionar departamento"
                labelKey={(dep) => dep.nombre_departamento}
                valueKey={(dep) => dep.id_departamento}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGuardar}
                disabled={guardando || !nombrePuesto.trim() || !depPuesto}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardando ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={cerrarModal} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}