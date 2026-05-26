import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { isAdmin, isRH } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Nomina {
  id_nomina: number;
  periodo: string;
  tipo: string;
  estado: "Pendiente" | "Procesada" | "Cerrada";
  fecha_creacion: string;
}

interface DetalleNomina {
  id_detalle: number;
  id_empleado: number;
  salario_base: number;
  horas_trabajadas: number;
  horas_extra: number;
  pago_horas_normales: number | null;
  pago_horas_extra: number | null;
  total_liquido: number | null;
}

interface ConceptoCatalogo {
  id_concepto: number;
  nombre: string;
  tipo: string;
  porcentaje: number | null;
  monto_fijo: number | null;
  fecha_aplica: string | null;
}

interface DetalleConcepto {
  id_detalle_concepto: number;
  monto: number;
  concepto: ConceptoCatalogo;
}

interface AjusteNomina {
  id_ajuste: number;
  descripcion: string;
  valor_anterior: number;
  valor_nuevo: number;
  campo_modificado: string;
  fecha: string;
  usuario: { nombre: string };
}

type Vista = "lista" | "detalle" | "historial";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Un concepto es editable manualmente si no tiene porcentaje, monto_fijo ni fecha_aplica
const esConceptoManual = (concepto: ConceptoCatalogo) =>
  concepto.porcentaje == null &&
  concepto.monto_fijo == null &&
  concepto.fecha_aplica == null;

export default function Nomina() {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const nombre = localStorage.getItem("nombre") || "Usuario";

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const [vista, setVista] = useState<Vista>("lista");
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [loading, setLoading] = useState(true);
  const [nominaActiva, setNominaActiva] = useState<Nomina | null>(null);

  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [tipo, setTipo] = useState<"Mensual" | "Quincenal">("Mensual");
  const [quincena, setQuincena] = useState<"Primera" | "Segunda">("Primera");
  const [guardandoCrear, setGuardandoCrear] = useState(false);

  const [detalles, setDetalles] = useState<DetalleNomina[]>([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [detalleExpandido, setDetalleExpandido] = useState<number | null>(null);
  const [conceptosMap, setConceptosMap] = useState<Record<number, DetalleConcepto[]>>({});
  const [editandoDetalle, setEditandoDetalle] = useState<DetalleNomina | null>(null);
  const [horasTrabajadas, setHorasTrabajadas] = useState("");
  const [horasExtra, setHorasExtra] = useState("");
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);
  const [recalculando, setRecalculando] = useState(false);

  const [editandoConcepto, setEditandoConcepto] = useState<DetalleConcepto | null>(null);
  const [montoConcepto, setMontoConcepto] = useState("");
  const [guardandoConcepto, setGuardandoConcepto] = useState(false);

  const [historial, setHistorial] = useState<AjusteNomina[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const [filtroEstado, setFiltroEstado] = useState<"todos" | "Pendiente" | "Procesada" | "Cerrada">("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "Mensual" | "Quincenal">("todos");

  const cargarNominas = () => {
    setLoading(true);
    fetchWithFallback("/nomina", { headers })
      .then((r) => r.json())
      .then((d) => setNominas(Array.isArray(d) ? d : []))
      .catch(() => setNominas([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarNominas(); }, []);

  const getPeriodo = () => {
    const hoy = new Date();
    const mes = MESES[hoy.getMonth()];
    const anio = hoy.getFullYear();
    if (tipo === "Mensual") return `${mes} ${anio}`;
    return `${quincena === "Primera" ? "Primera" : "Segunda"} Quincena ${mes} ${anio}`;
  };

  const fmt = (n: number | null | undefined) =>
    n != null ? `Q ${n.toLocaleString("es-GT", { minimumFractionDigits: 2 })}` : "—";

  const fmtCampo = (campo: string, valor: number) => {
    const camposHoras = ["horas_trabajadas", "horas_extra"];
    if (camposHoras.includes(campo)) return `${valor} hrs`;
    return fmt(valor);
  };

  const handleCrearNomina = async () => {
    setGuardandoCrear(true);
    try {
      const res = await fetchWithFallback("/nomina", {
        method: "POST",
        headers,
        body: JSON.stringify({ periodo: getPeriodo(), tipo }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al crear");
      }
      setMostrarCrear(false);
      cargarNominas();
    } catch (e: any) {
      alert(e.message || "No se pudo crear la nómina.");
    } finally {
      setGuardandoCrear(false);
    }
  };

  const handleEliminarNomina = async (id: number) => {
    if (!confirm("¿Eliminar esta nómina?")) return;
    try {
      await fetchWithFallback(`/nomina/${id}`, { method: "DELETE", headers });
      cargarNominas();
    } catch {
      alert("No se pudo eliminar.");
    }
  };

  const handleCambiarEstado = async (id: number, estado: string) => {
    try {
      await fetchWithFallback(`/nomina/${id}/estado`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ estado }),
      });
      cargarNominas();
      if (nominaActiva?.id_nomina === id) {
        setNominaActiva((prev) => prev ? { ...prev, estado: estado as any } : prev);
      }
    } catch {
      alert("No se pudo cambiar el estado.");
    }
  };

  const abrirDetalle = async (nomina: Nomina) => {
    setNominaActiva(nomina);
    setVista("detalle");
    setDetalleExpandido(null);
    setConceptosMap({});
    setLoadingDetalles(true);
    try {
      const res = await fetchWithFallback(`/nomina/${nomina.id_nomina}/detalles`, { headers });
      const data = await res.json();
      setDetalles(Array.isArray(data) ? data : []);
    } catch {
      setDetalles([]);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const toggleConceptos = async (id_detalle: number) => {
    if (detalleExpandido === id_detalle) {
      setDetalleExpandido(null);
      return;
    }
    setDetalleExpandido(id_detalle);
    if (!conceptosMap[id_detalle]) {
      try {
        const res = await fetchWithFallback(`/nomina/detalles/${id_detalle}/conceptos`, { headers });
        const data = await res.json();
        setConceptosMap((prev) => ({ ...prev, [id_detalle]: Array.isArray(data) ? data : [] }));
      } catch {
        setConceptosMap((prev) => ({ ...prev, [id_detalle]: [] }));
      }
    }
  };

  const abrirEditarDetalle = (detalle: DetalleNomina) => {
    setEditandoDetalle(detalle);
    setHorasTrabajadas(String(detalle.horas_trabajadas));
    setHorasExtra(String(detalle.horas_extra));
  };

  const handleGuardarDetalle = async () => {
    if (!editandoDetalle) return;
    setGuardandoDetalle(true);
    try {
      await fetchWithFallback(`/nomina/detalles/${editandoDetalle.id_detalle}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          horas_trabajadas: Number(horasTrabajadas),
          horas_extra: Number(horasExtra),
        }),
      });
      setEditandoDetalle(null);
      if (nominaActiva) abrirDetalle(nominaActiva);
    } catch {
      alert("No se pudo actualizar el detalle.");
    } finally {
      setGuardandoDetalle(false);
    }
  };

  const abrirEditarConcepto = (concepto: DetalleConcepto) => {
    setEditandoConcepto(concepto);
    setMontoConcepto(String(concepto.monto));
  };

  const handleGuardarConcepto = async () => {
    if (!editandoConcepto) return;
    setGuardandoConcepto(true);
    try {
      await fetchWithFallback(`/nomina/conceptos/${editandoConcepto.id_detalle_concepto}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ monto: Number(montoConcepto) }),
      });
      setEditandoConcepto(null);
      if (detalleExpandido) {
        const res = await fetchWithFallback(`/nomina/detalles/${detalleExpandido}/conceptos`, { headers });
        const data = await res.json();
        setConceptosMap((prev) => ({ ...prev, [detalleExpandido]: Array.isArray(data) ? data : [] }));
      }
    } catch {
      alert("No se pudo actualizar el concepto.");
    } finally {
      setGuardandoConcepto(false);
    }
  };

  const handleRecalcular = async () => {
    if (!nominaActiva) return;
    if (!confirm("¿Recalcular la nómina? Esto actualizará todos los totales y la marcará como Procesada.")) return;
    setRecalculando(true);
    try {
      const res = await fetchWithFallback(`/nomina/${nominaActiva.id_nomina}/recalcular`, {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error();
      await abrirDetalle(nominaActiva);
      cargarNominas();
      setNominaActiva((prev) => prev ? { ...prev, estado: "Procesada" } : prev);
    } catch {
      alert("No se pudo recalcular.");
    } finally {
      setRecalculando(false);
    }
  };

  const abrirHistorial = async (nomina: Nomina) => {
    setNominaActiva(nomina);
    setVista("historial");
    setLoadingHistorial(true);
    try {
      const res = await fetchWithFallback(`/nomina/${nomina.id_nomina}/ajustes`, { headers });
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch {
      setHistorial([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  const nominasFiltradas = nominas.filter((n) => {
    if (filtroEstado !== "todos" && n.estado !== filtroEstado) return false;
    if (filtroTipo !== "todos" && n.tipo !== filtroTipo) return false;
    return true;
  });

  const estadoBadge = (estado: string) => {
    if (estado === "Procesada") return "bg-green-100 text-green-700";
    if (estado === "Cerrada") return "bg-gray-100 text-gray-600";
    return "bg-yellow-100 text-yellow-700";
  };

  const canEdit = isAdmin() || isRH();

  // ══════════════════════════════════════════
  // VISTA: LISTA
  // ══════════════════════════════════════════
  if (vista === "lista") return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />
      <main className="max-w-6xl mx-auto px-6 mt-10">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <h1 className="text-3xl font-bold">Gestión de Nómina</h1>
          </div>
          {canEdit && (
            <button onClick={() => setMostrarCrear(true)} className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nueva Nómina
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1">
            {(["todos", "Pendiente", "Procesada", "Cerrada"] as const).map((e) => (
              <button key={e} onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  filtroEstado === e ? estadoBadge(e) + " border-current" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {e === "todos" ? "Todos" : e}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["todos", "Mensual", "Quincenal"] as const).map((t) => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                  filtroTipo === t ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {t === "todos" ? "Todos los tipos" : t}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-400 ml-auto">{nominasFiltradas.length} nómina{nominasFiltradas.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-gray-400 text-center py-10">Cargando...</p>
          ) : nominasFiltradas.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-4">No hay nóminas generadas</p>
              {canEdit && (
                <button onClick={() => setMostrarCrear(true)} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear primera nómina
                </button>
              )}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="p-4 text-left font-medium">ID</th>
                  <th className="p-4 text-left font-medium">Periodo</th>
                  <th className="p-4 text-left font-medium">Tipo</th>
                  <th className="p-4 text-left font-medium">Estado</th>
                  <th className="p-4 text-left font-medium">Fecha Creación</th>
                  <th className="p-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {nominasFiltradas.map((n) => (
                  <tr key={n.id_nomina} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-500">#{n.id_nomina}</td>
                    <td className="p-4 font-medium">{n.periodo}</td>
                    <td className="p-4 text-sm text-gray-600">{n.tipo}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge(n.estado)}`}>{n.estado}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {n.fecha_creacion ? new Date(n.fecha_creacion).toLocaleDateString("es-GT") : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => abrirDetalle(n)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Ver detalle">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button onClick={() => abrirHistorial(n)} className="text-gray-400 hover:text-purple-600 transition p-1.5 rounded-md hover:bg-purple-50" title="Historial de ajustes">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                          </svg>
                        </button>
                        {canEdit && n.estado !== "Cerrada" && (
                          <select value={n.estado} onChange={(e) => handleCambiarEstado(n.id_nomina, e.target.value)}
                            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Procesada">Procesada</option>
                            <option value="Cerrada">Cerrada</option>
                          </select>
                        )}
                        {canEdit && n.estado !== "Cerrada" && (
                          <button onClick={() => handleEliminarNomina(n.id_nomina)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" /><path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal crear nómina */}
      {mostrarCrear && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">Nueva Nómina</h3>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <div className="flex gap-2 mb-4">
              {(["Mensual", "Quincenal"] as const).map((t) => (
                <button key={t} onClick={() => setTipo(t)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition border ${
                    tipo === t ? "bg-green-600 text-white border-green-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {tipo === "Quincenal" && (
              <>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quincena</label>
                <div className="flex gap-2 mb-4">
                  {(["Primera", "Segunda"] as const).map((q) => (
                    <button key={q} onClick={() => setQuincena(q)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium transition border ${
                        quincena === q ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className={`rounded-md px-4 py-3 mb-6 text-sm font-medium ${tipo === "Mensual" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"}`}>
              Periodo: <span className="font-bold">{getPeriodo()}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCrearNomina} disabled={guardandoCrear}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-60"
              >
                {guardandoCrear ? "Creando..." : "Crear"}
              </button>
              <button onClick={() => setMostrarCrear(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════
  // VISTA: DETALLE
  // ══════════════════════════════════════════
  if (vista === "detalle" && nominaActiva) return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />
      <main className="max-w-6xl mx-auto px-6 mt-10">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setVista("lista")} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">{nominaActiva.periodo}</h1>
              <p className="text-sm text-gray-500">
                {nominaActiva.tipo} ·{" "}
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${estadoBadge(nominaActiva.estado)}`}>
                  {nominaActiva.estado}
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => abrirHistorial(nominaActiva)} className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium px-3 py-2 rounded-md hover:bg-purple-50 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Historial
            </button>
            {canEdit && nominaActiva.estado !== "Cerrada" && (
              <button onClick={handleRecalcular} disabled={recalculando}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-medium text-sm disabled:opacity-60"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {recalculando ? "Calculando..." : "Recalcular"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loadingDetalles ? (
            <p className="text-gray-400 text-center py-10">Cargando detalles...</p>
          ) : detalles.length === 0 ? (
            <p className="text-gray-400 text-center py-10">No hay detalles en esta nómina</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="p-4 text-left font-medium">Empleado ID</th>
                  <th className="p-4 text-left font-medium">Salario Base</th>
                  <th className="p-4 text-left font-medium">H. Trabajadas</th>
                  <th className="p-4 text-left font-medium">H. Extra</th>
                  <th className="p-4 text-left font-medium">Pago Normal</th>
                  <th className="p-4 text-left font-medium">Pago Extra</th>
                  <th className="p-4 text-left font-medium">Total Líquido</th>
                  <th className="p-4 text-center font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((det) => (
                  <>
                    <tr key={det.id_detalle} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-medium">#{det.id_empleado}</td>
                      <td className="p-4 text-sm">{fmt(det.salario_base)}</td>
                      <td className="p-4 text-sm">{det.horas_trabajadas}</td>
                      <td className="p-4 text-sm">{det.horas_extra}</td>
                      <td className="p-4 text-sm">{fmt(det.pago_horas_normales)}</td>
                      <td className="p-4 text-sm">{fmt(det.pago_horas_extra)}</td>
                      <td className="p-4 text-sm font-semibold text-green-700">{fmt(det.total_liquido)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => toggleConceptos(det.id_detalle)}
                            className={`transition p-1.5 rounded-md ${detalleExpandido === det.id_detalle ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-600 hover:bg-blue-50"}`}
                            title="Ver conceptos"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polyline points={detalleExpandido === det.id_detalle ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                            </svg>
                          </button>
                          {canEdit && nominaActiva.estado !== "Cerrada" && (
                            <button onClick={() => abrirEditarDetalle(det)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar horas">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandida conceptos */}
                    {detalleExpandido === det.id_detalle && (
                      <tr key={`conceptos-${det.id_detalle}`} className="bg-gray-50">
                        <td colSpan={8} className="px-8 py-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Conceptos</p>
                          {!conceptosMap[det.id_detalle] ? (
                            <p className="text-gray-400 text-sm">Cargando...</p>
                          ) : conceptosMap[det.id_detalle].length === 0 ? (
                            <p className="text-gray-400 text-sm">Sin conceptos</p>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {conceptosMap[det.id_detalle].map((c) => {
                                const esManual = esConceptoManual(c.concepto);
                                const esDeduccion = c.concepto.tipo === "Deduccion" || c.concepto.tipo === "Descuento";
                                return (
                                  <div key={c.id_detalle_concepto}
                                    className={`rounded-lg px-3 py-2 text-xs ${esDeduccion ? "bg-red-50 border border-red-100" : "bg-green-50 border border-green-100"}`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <p className={`font-medium ${esDeduccion ? "text-red-700" : "text-green-700"}`}>
                                        {c.concepto.nombre}
                                      </p>
                                      {/* Solo mostrar editar si es manual y la nómina no está cerrada */}
                                      {canEdit && nominaActiva.estado !== "Cerrada" && esManual ? (
                                        <button
                                          onClick={() => abrirEditarConcepto(c)}
                                          className="text-gray-300 hover:text-amber-500 transition shrink-0"
                                          title="Editar monto manual"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                          </svg>
                                        </button>
                                      ) : (
                                        /* Ícono de candado para conceptos con fórmula */
                                        <span title={
                                          c.concepto.porcentaje != null ? `Calculado: ${c.concepto.porcentaje * 100}%` :
                                          c.concepto.monto_fijo != null ? `Monto fijo: Q${c.concepto.monto_fijo}` :
                                          c.concepto.fecha_aplica != null ? "Calculado por fecha" : ""
                                        } className="text-gray-200 shrink-0">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                          </svg>
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-500 mt-0.5 flex items-center gap-1">
                                      {c.concepto.tipo}
                                      {!esManual && (
                                        <span className="text-gray-300 text-xs">· auto</span>
                                      )}
                                    </p>
                                    <p className={`font-bold mt-1 ${esDeduccion ? "text-red-600" : "text-green-600"}`}>
                                      {fmt(c.monto)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal editar detalle horas */}
      {editandoDetalle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-1">Editar Horas</h3>
            <p className="text-sm text-gray-500 mb-4">Empleado #{editandoDetalle.id_empleado}</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas Trabajadas</label>
            <input
              type="number" min="0" step="1"
              value={horasTrabajadas}
              onChange={(e) => setHorasTrabajadas(String(Math.floor(Number(e.target.value))))}
              className="border border-gray-300 rounded-md w-full p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas Extra</label>
            <input
              type="number" min="0" step="1"
              value={horasExtra}
              onChange={(e) => setHorasExtra(String(Math.floor(Number(e.target.value))))}
              className="border border-gray-300 rounded-md w-full p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-3">
              <button onClick={handleGuardarDetalle} disabled={guardandoDetalle}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-60"
              >
                {guardandoDetalle ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setEditandoDetalle(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal editar concepto manual */}
      {editandoConcepto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-1">Editar Concepto</h3>
            <p className="text-sm text-gray-500 mb-1">{editandoConcepto.concepto.nombre}</p>
            <p className="text-xs text-gray-400 mb-4">{editandoConcepto.concepto.tipo} · Ingreso manual</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto (Q)</label>
            <input
              type="number" min="0" step="0.01"
              value={montoConcepto}
              onChange={(e) => setMontoConcepto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGuardarConcepto()}
              className="border border-gray-300 rounded-md w-full p-2 mb-6 focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={handleGuardarConcepto} disabled={guardandoConcepto || !montoConcepto}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-medium disabled:opacity-60"
              >
                {guardandoConcepto ? "Guardando..." : "Guardar"}
              </button>
              <button onClick={() => setEditandoConcepto(null)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ══════════════════════════════════════════
  // VISTA: HISTORIAL
  // ══════════════════════════════════════════
  if (vista === "historial" && nominaActiva) return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />
      <main className="max-w-5xl mx-auto px-6 mt-10">

        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setVista("detalle")} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold">Historial de Ajustes</h1>
            <p className="text-sm text-gray-500">{nominaActiva.periodo} · {nominaActiva.tipo}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          {loadingHistorial ? (
            <p className="text-gray-400 text-center py-6">Cargando...</p>
          ) : historial.length === 0 ? (
            <p className="text-gray-400 text-center py-6">Sin ajustes registrados</p>
          ) : (
            <ul className="divide-y">
              {historial.map((aj) => (
                <li key={aj.id_ajuste} className="py-4 flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{aj.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Campo: <span className="font-medium">{aj.campo_modificado}</span> · Por: <span className="font-medium">{aj.usuario?.nombre || "—"}</span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      <span className="text-red-500 font-medium">{fmtCampo(aj.campo_modificado, aj.valor_anterior)}</span>
                      {" → "}
                      <span className="text-green-600 font-medium">{fmtCampo(aj.campo_modificado, aj.valor_nuevo)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {aj.fecha ? new Date(aj.fecha).toLocaleString("es-GT") : "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );

  return null;
}