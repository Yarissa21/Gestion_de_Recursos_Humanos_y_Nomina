import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Empleado {
  id: number;
  nombre: string;
  apellido: string;
}

interface Faltantes {
  expediente: string[];
  academicos: string[];
}

interface ResultadoValidacion {
  empleado: Empleado;
  id_empleado: number;
  estado: "COMPLETO" | "EN_PROCESO" | "INCOMPLETO";
  total_obligatorios: number;
  total_subidos: number;
  faltantes: Faltantes;
}

const estadoBadge = (estado: string) => {
  if (estado === "COMPLETO") return "bg-green-100 text-green-700";
  if (estado === "EN_PROCESO") return "bg-yellow-100 text-yellow-700";
  return "bg-red-100 text-red-700";
};

const estadoLabel = (estado: string) => {
  if (estado === "COMPLETO") return "Completo";
  if (estado === "EN_PROCESO") return "En Proceso";
  return "Incompleto";
};

export default function ValidacionExpediente() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const navigate = useNavigate();

  const [resultados, setResultados] = useState<ResultadoValidacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [detalle, setDetalle] = useState<ResultadoValidacion | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await fetchWithFallback("/validacion-expediente/resumen", { headers });
      const data = await res.json();
      setResultados(
        Array.isArray(data)
          ? data.map((r: any) => ({ ...r, faltantes: { expediente: [], academicos: [] } }))
          : []
      );
    } catch {
      setResultados([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirDetalle = async (r: ResultadoValidacion) => {
    setDetalle({ ...r, faltantes: { expediente: [], academicos: [] } });
    setCargandoDetalle(true);
    try {
      const res = await fetchWithFallback(`/validacion-expediente/${r.id_empleado}`, { headers });
      const data = await res.json();
      const actualizado: ResultadoValidacion = {
        ...r,
        estado: data.estado,
        total_obligatorios: data.total_obligatorios,
        total_subidos: data.total_subidos,
        faltantes: data.faltantes,
      };
      setDetalle(actualizado);
      setResultados((prev) =>
        prev.map((item) => item.id_empleado === r.id_empleado ? actualizado : item)
      );
    } catch {
    } finally {
      setCargandoDetalle(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const resultadosFiltrados = resultados.filter((r) => {
    if (filtroEstado !== "todos" && r.estado !== filtroEstado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        r.empleado.nombre.toLowerCase().includes(q) ||
        r.empleado.apellido.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCompletos = resultados.filter((r) => r.estado === "COMPLETO").length;
  const totalEnProceso = resultados.filter((r) => r.estado === "EN_PROCESO").length;
  const totalIncompletos = resultados.filter((r) => r.estado === "INCOMPLETO").length;

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-6xl mx-auto px-6 mt-10">

          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <h1 className="text-3xl font-bold">Validación de Expediente</h1>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Total empleados</p>
              <p className="text-3xl font-bold text-gray-800">{resultados.length}</p>
            </div>
            <div
              className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:shadow-md transition ${filtroEstado === "COMPLETO" ? "border-green-400" : "border-green-100"}`}
              onClick={() => setFiltroEstado(filtroEstado === "COMPLETO" ? "todos" : "COMPLETO")}
            >
              <p className="text-xs text-gray-400 mb-1">Completos</p>
              <p className="text-3xl font-bold text-green-600">{totalCompletos}</p>
            </div>
            <div
              className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:shadow-md transition ${filtroEstado === "EN_PROCESO" ? "border-yellow-400" : "border-yellow-100"}`}
              onClick={() => setFiltroEstado(filtroEstado === "EN_PROCESO" ? "todos" : "EN_PROCESO")}
            >
              <p className="text-xs text-gray-400 mb-1">En Proceso</p>
              <p className="text-3xl font-bold text-yellow-600">{totalEnProceso}</p>
            </div>
            <div
              className={`bg-white rounded-xl shadow-sm p-4 border cursor-pointer hover:shadow-md transition ${filtroEstado === "INCOMPLETO" ? "border-red-400" : "border-red-100"}`}
              onClick={() => setFiltroEstado(filtroEstado === "INCOMPLETO" ? "todos" : "INCOMPLETO")}
            >
              <p className="text-xs text-gray-400 mb-1">Incompletos</p>
              <p className="text-3xl font-bold text-red-600">{totalIncompletos}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Buscar por nombre o apellido..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-1">
              {(["todos", "COMPLETO", "EN_PROCESO", "INCOMPLETO"] as const).map((estado) => (
                <button key={estado} onClick={() => setFiltroEstado(estado)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                    filtroEstado === estado
                      ? estado === "COMPLETO" ? "bg-green-100 text-green-700 border-green-300"
                        : estado === "EN_PROCESO" ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : estado === "INCOMPLETO" ? "bg-red-100 text-red-700 border-red-300"
                        : "bg-gray-800 text-white border-gray-800"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {estado === "todos" ? "Todos" : estadoLabel(estado)}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {resultadosFiltrados.length} empleado{resultadosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {resultadosFiltrados.length === 0 ? (
              <p className="text-gray-400 text-center py-10">No hay resultados</p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="p-4 text-left font-medium">Empleado</th>
                    <th className="p-4 text-left font-medium">Estado</th>
                    <th className="p-4 text-left font-medium">Progreso</th>
                    <th className="p-4 text-left font-medium">Faltantes</th>
                    <th className="p-4 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {resultadosFiltrados.map((r) => {
                    const porcentaje = r.total_obligatorios > 0
                      ? Math.round((r.total_subidos / r.total_obligatorios) * 100)
                      : 0;
                    const totalFaltantes = r.total_obligatorios - r.total_subidos;
                    return (
                      <tr key={r.id_empleado} className="border-t hover:bg-gray-50 transition">
                        <td className="p-4">
                          <p className="text-sm font-medium text-gray-800">
                            {r.empleado.nombre} {r.empleado.apellido}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge(r.estado)}`}>
                            {estadoLabel(r.estado)}
                          </span>
                        </td>
                        <td className="p-4 min-w-36">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  r.estado === "COMPLETO" ? "bg-green-500"
                                  : r.estado === "EN_PROCESO" ? "bg-yellow-500"
                                  : "bg-red-400"
                                }`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">{porcentaje}%</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{r.total_subidos} / {r.total_obligatorios}</p>
                        </td>
                        <td className="p-4">
                          {totalFaltantes === 0 ? (
                            <span className="text-green-600 text-xs font-medium">✓ Completo</span>
                          ) : (
                            <span className="text-red-500 text-xs">{totalFaltantes} faltante{totalFaltantes !== 1 ? "s" : ""}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => abrirDetalle(r)}
                              className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50"
                              title="Ver detalle"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button
                              onClick={() => navigate("/expediente")}
                              className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50"
                              title="Ir a expediente"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
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
        </main>
      )}

      {detalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-semibold">{detalle.empleado.nombre} {detalle.empleado.apellido}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge(detalle.estado)}`}>
                  {estadoLabel(detalle.estado)}
                </span>
              </div>
              <button onClick={() => setDetalle(null)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {cargandoDetalle ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-gray-400 text-sm">Cargando detalle...</p>
              </div>
            ) : (
              <>
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Progreso general</span>
                    <span className="font-medium">{detalle.total_subidos} / {detalle.total_obligatorios}</span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        detalle.estado === "COMPLETO" ? "bg-green-500"
                        : detalle.estado === "EN_PROCESO" ? "bg-yellow-500"
                        : "bg-red-400"
                      }`}
                      style={{ width: detalle.total_obligatorios > 0 ? `${Math.round((detalle.total_subidos / detalle.total_obligatorios) * 100)}%` : "0%" }}
                    />
                  </div>
                </div>

                {detalle.faltantes.expediente.length === 0 && detalle.faltantes.academicos.length === 0 ? (
                  <div className="flex flex-col items-center py-6 gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    <p className="text-green-600 font-medium text-sm">Expediente completo</p>
                    <p className="text-gray-400 text-xs">Todos los documentos obligatorios están subidos</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 max-h-64 overflow-y-auto pr-1">
                    {detalle.faltantes.expediente.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                          Expediente — Faltantes
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {detalle.faltantes.expediente.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {detalle.faltantes.academicos.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
                          Académicos — Faltantes
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {detalle.faltantes.academicos.map((doc, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                              </svg>
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => { setDetalle(null); navigate("/expediente"); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-white py-2 rounded-md hover:bg-amber-600 transition font-medium text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                    Ir a Expediente
                  </button>
                  <button onClick={() => setDetalle(null)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium text-sm"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}