import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { fetchWithFallback } from "../../utils/api";
import { isAdminOrRH, isUser } from "../../utils/auth";

interface Nomina {
  id_nomina: number;
  periodo: string;
  tipo: string;
  estado: string;
}

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

function SearchSelect({
  options,
  value,
  onChange,
  placeholder,
  labelKey,
  valueKey,
  disabled = false,
  filtradoPor,
}: {
  options: any[];
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder: string;
  labelKey: (o: any) => string;
  valueKey: (o: any) => number;
  disabled?: boolean;
  filtradoPor?: string;
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
        className={`w-full border rounded-md px-3 py-1.5 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

      {filtradoPor && (
        <p className="text-xs text-blue-500 mt-0.5">{filtradoPor}</p>
      )}

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

const CACHE_KEY = "cache_reportes";
const CACHE_TTL = 5 * 60 * 1000;

export default function Reportes() {
  const rol = localStorage.getItem("rol")?.toLowerCase() || "";
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  if (!isAdminOrRH() && !isUser()) return <Navigate to="/dashboard" replace />;

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const cargado = useRef(false);

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState<string | null>(null);

  const [empSelAdmin, setEmpSelAdmin] = useState<number | "">("");
  const [nominaSelAdmin, setNominaSelAdmin] = useState<number | "">("");

  const [nominaDetalle, setNominaDetalle] = useState<number | "">("");
  const [empDetalle, setEmpDetalle] = useState<number | "">("");
  const [empleadosEnNomina, setEmpleadosEnNomina] = useState<Empleado[]>([]);
  const [nominasDeEmpleado, setNominasDeEmpleado] = useState<Nomina[]>([]);
  const [loadingFiltro, setLoadingFiltro] = useState(false);

  const [miEmpleado, setMiEmpleado] = useState<Empleado | null>(null);
  const [nominaSelUser, setNominaSelUser] = useState<number | "">("");

  const LOCAL = "http://localhost:3000";
  const REMOTE = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

  const getBase = async () => {
    try {
      await fetch(`${LOCAL}/health`, { signal: AbortSignal.timeout(2000) });
      return LOCAL;
    } catch { return REMOTE; }
  };

  const cargar = async (forzar = false) => {
    if (!forzar) {
      const cache = sessionStorage.getItem(CACHE_KEY);
      if (cache) {
        const data = JSON.parse(cache);
        if (Date.now() < data._expires) {
          if (isAdminOrRH()) {
            setEmpleados(data.empleados || []);
            setNominas(data.nominas || []);
          } else {
            if (data.miEmpleado) setMiEmpleado(data.miEmpleado);
            setNominas(data.nominas || []);
          }
          setLoading(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoading(true);
    try {
      if (isAdminOrRH()) {
        const [empsRes, nominasRes] = await Promise.all([
          fetchWithFallback("/empleados", { headers }).then(r => r.json()),
          fetchWithFallback("/nomina", { headers }).then(r => r.json()),
        ]);
        const empleados = Array.isArray(empsRes) ? empsRes : [];
        const nominas = Array.isArray(nominasRes) ? nominasRes : [];
        setEmpleados(empleados);
        setNominas(nominas);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          empleados, nominas,
        }));
      } else {
        const [perfilRes, nominasRes] = await Promise.all([
          fetchWithFallback("/empleados/mi-perfil", { headers }).then(r => r.json()),
          fetchWithFallback("/nomina/mis-nominas", { headers }).then(r => r.json()),
        ]);
        const miEmpleado = perfilRes?.id_empleado ? perfilRes : null;
        const nominas = Array.isArray(nominasRes) ? nominasRes : [];
        if (miEmpleado) setMiEmpleado(miEmpleado);
        setNominas(nominas);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          miEmpleado, nominas,
        }));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    cargar();
  }, []);

  const handleNominaDetalleChange = async (id_nomina: number | "") => {
    setNominaDetalle(id_nomina);
    if (!id_nomina) { setEmpleadosEnNomina([]); return; }
    setLoadingFiltro(true);
    try {
      const res = await fetchWithFallback(`/nomina/${id_nomina}/detalles`, { headers });
      const data = await res.json();
      if (Array.isArray(data)) {
        const emps = data
          .filter((d: any) => d.empleado)
          .map((d: any) => ({
            id_empleado: d.id_empleado,
            nombre_empleado: d.empleado.nombre_empleado,
            apellido_empleado: d.empleado.apellido_empleado,
          }));
        setEmpleadosEnNomina(emps);
        if (empDetalle && !emps.some((e: Empleado) => e.id_empleado === empDetalle)) {
          setEmpDetalle("");
        }
      }
    } catch { setEmpleadosEnNomina([]); }
    finally { setLoadingFiltro(false); }
  };

  const handleEmpDetalleChange = async (id_empleado: number | "") => {
    setEmpDetalle(id_empleado);
    if (!id_empleado) { setNominasDeEmpleado([]); return; }
    setLoadingFiltro(true);
    try {
      const nominasFiltradas: Nomina[] = [];
      for (const n of nominas) {
        try {
          const det = await fetchWithFallback(`/nomina/${n.id_nomina}/detalles`, { headers }).then(r => r.json());
          if (Array.isArray(det) && det.some((d: any) => d.id_empleado === id_empleado)) {
            nominasFiltradas.push(n);
          }
        } catch {}
      }
      setNominasDeEmpleado(nominasFiltradas);
      if (nominaDetalle && !nominasFiltradas.some(n => n.id_nomina === nominaDetalle)) {
        setNominaDetalle("");
        setEmpleadosEnNomina([]);
      }
    } catch { setNominasDeEmpleado([]); }
    finally { setLoadingFiltro(false); }
  };

  const abrirPDF = async (endpoint: string, key: string) => {
    setGenerando(key);
    try {
      const base = await getBase();
      const res = await fetch(`${base}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('No autorizado');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch {
      alert('No se pudo generar el reporte.');
    } finally {
      setGenerando(null);
    }
  };

  const btnClass = (disabled: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition shrink-0 ${
      disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
    }`;

  const cardClass = "bg-white rounded-xl shadow-sm p-6 border border-gray-100";

  const IconoPDF = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-5xl mx-auto px-6 mt-10">

          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <h1 className="text-3xl font-bold">Reportes</h1>
          </div>

          {isAdminOrRH() ? (
            <div className="flex flex-col gap-6">

              {/* NÓMINAS */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Nóminas
                </h2>
                <div className="flex flex-col gap-4">

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Reporte General de Nóminas</p>
                      <p className="text-xs text-gray-400 mt-0.5">Todas las nóminas con desglose de empleados y conceptos</p>
                    </div>
                    <button onClick={() => abrirPDF("/reportes/nominas", "nominas-general")}
                      disabled={generando === "nominas-general"} className={btnClass(generando === "nominas-general")}>
                      <IconoPDF />{generando === "nominas-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Nómina Específica</p>
                      <p className="text-xs text-gray-400 mt-0.5">Reporte detallado de una nómina</p>
                      <div className="mt-2">
                        <SearchSelect
                          options={nominas}
                          value={nominaSelAdmin}
                          onChange={setNominaSelAdmin}
                          placeholder="Seleccionar nómina"
                          labelKey={(n) => `#${n.id_nomina} — ${n.periodo} (${n.tipo})`}
                          valueKey={(n) => n.id_nomina}
                        />
                      </div>
                    </div>
                    <button onClick={() => nominaSelAdmin && abrirPDF(`/reportes/nominas/${nominaSelAdmin}`, "nomina-id")}
                      disabled={!nominaSelAdmin || generando === "nomina-id"} className={btnClass(!nominaSelAdmin || generando === "nomina-id")}>
                      <IconoPDF />{generando === "nomina-id" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Historial de Nóminas por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Todas las nóminas en las que ha participado un empleado</p>
                      <div className="mt-2">
                        <SearchSelect
                          options={empleados}
                          value={empSelAdmin}
                          onChange={setEmpSelAdmin}
                          placeholder="Seleccionar empleado"
                          labelKey={(e) => `${e.nombre_empleado} ${e.apellido_empleado}`}
                          valueKey={(e) => e.id_empleado}
                        />
                      </div>
                    </div>
                    <button onClick={() => empSelAdmin && abrirPDF(`/reportes/nominas/empleado/${empSelAdmin}`, "nomina-empleado")}
                      disabled={!empSelAdmin || generando === "nomina-empleado"} className={btnClass(!empSelAdmin || generando === "nomina-empleado")}>
                      <IconoPDF />{generando === "nomina-empleado" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-start justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Detalle de Empleado en Nómina</p>
                      <p className="text-xs text-gray-400 mt-0.5">Selecciona nómina para filtrar empleados, o empleado para filtrar nóminas</p>
                      {loadingFiltro && <p className="text-xs text-blue-500 mt-1">Filtrando...</p>}
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1">
                          <SearchSelect
                            options={nominasDeEmpleado.length > 0 ? nominasDeEmpleado : nominas}
                            value={nominaDetalle}
                            onChange={handleNominaDetalleChange}
                            placeholder="Nómina"
                            labelKey={(n) => `#${n.id_nomina} — ${n.periodo}`}
                            valueKey={(n) => n.id_nomina}
                            disabled={loadingFiltro}
                            filtradoPor={nominasDeEmpleado.length > 0 ? "Filtrado por empleado" : undefined}
                          />
                        </div>
                        <div className="flex-1">
                          <SearchSelect
                            options={empleadosEnNomina.length > 0 ? empleadosEnNomina : empleados}
                            value={empDetalle}
                            onChange={handleEmpDetalleChange}
                            placeholder="Empleado"
                            labelKey={(e) => `${e.nombre_empleado} ${e.apellido_empleado}`}
                            valueKey={(e) => e.id_empleado}
                            disabled={loadingFiltro}
                            filtradoPor={empleadosEnNomina.length > 0 ? "Filtrado por nómina" : undefined}
                          />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => nominaDetalle && empDetalle && abrirPDF(`/reportes/nominas/${nominaDetalle}/empleado/${empDetalle}`, "nomina-detalle-emp")}
                      disabled={!nominaDetalle || !empDetalle || generando === "nomina-detalle-emp" || loadingFiltro}
                      className={btnClass(!nominaDetalle || !empDetalle || generando === "nomina-detalle-emp" || loadingFiltro)}
                    >
                      <IconoPDF />{generando === "nomina-detalle-emp" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                </div>
              </div>

              {/* EXPEDIENTES */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Expedientes
                </h2>
                <div className="flex flex-col gap-4">

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Reporte General de Expedientes</p>
                      <p className="text-xs text-gray-400 mt-0.5">Estado de expedientes de todos los empleados</p>
                    </div>
                    <button onClick={() => abrirPDF("/reportes/expedientes", "expedientes-general")}
                      disabled={generando === "expedientes-general"} className={btnClass(generando === "expedientes-general")}>
                      <IconoPDF />{generando === "expedientes-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Expediente por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Documentos subidos y faltantes de un empleado</p>
                      <div className="mt-2">
                        <SearchSelect
                          options={empleados}
                          value={empSelAdmin}
                          onChange={setEmpSelAdmin}
                          placeholder="Seleccionar empleado"
                          labelKey={(e) => `${e.nombre_empleado} ${e.apellido_empleado}`}
                          valueKey={(e) => e.id_empleado}
                        />
                      </div>
                    </div>
                    <button onClick={() => empSelAdmin && abrirPDF(`/reportes/expedientes/${empSelAdmin}`, "expediente-emp")}
                      disabled={!empSelAdmin || generando === "expediente-emp"} className={btnClass(!empSelAdmin || generando === "expediente-emp")}>
                      <IconoPDF />{generando === "expediente-emp" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                </div>
              </div>

              {/* ACADÉMICOS */}
              <div className={cardClass}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  Información Académica
                </h2>
                <div className="flex flex-col gap-4">

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Reporte General Académico</p>
                      <p className="text-xs text-gray-400 mt-0.5">Información académica de todos los empleados</p>
                    </div>
                    <button onClick={() => abrirPDF("/reportes/academicos", "academicos-general")}
                      disabled={generando === "academicos-general"} className={btnClass(generando === "academicos-general")}>
                      <IconoPDF />{generando === "academicos-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Académico por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Títulos, certificaciones y documentos académicos</p>
                      <div className="mt-2">
                        <SearchSelect
                          options={empleados}
                          value={empSelAdmin}
                          onChange={setEmpSelAdmin}
                          placeholder="Seleccionar empleado"
                          labelKey={(e) => `${e.nombre_empleado} ${e.apellido_empleado}`}
                          valueKey={(e) => e.id_empleado}
                        />
                      </div>
                    </div>
                    <button onClick={() => empSelAdmin && abrirPDF(`/reportes/academicos/${empSelAdmin}`, "academico-emp")}
                      disabled={!empSelAdmin || generando === "academico-emp"} className={btnClass(!empSelAdmin || generando === "academico-emp")}>
                      <IconoPDF />{generando === "academico-emp" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {miEmpleado ? (
                <>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">{miEmpleado.nombre_empleado.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">{miEmpleado.nombre_empleado} {miEmpleado.apellido_empleado}</p>
                      <p className="text-xs text-blue-600">Tus reportes personales</p>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      Nóminas
                    </h2>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-medium">Mi Historial de Nóminas</p>
                          <p className="text-xs text-gray-400 mt-0.5">Todas las nóminas en las que has participado</p>
                        </div>
                        <button onClick={() => abrirPDF(`/reportes/nominas/empleado/${miEmpleado.id_empleado}`, "user-nominas")}
                          disabled={generando === "user-nominas"} className={btnClass(generando === "user-nominas")}>
                          <IconoPDF />{generando === "user-nominas" ? "Generando..." : "Generar PDF"}
                        </button>
                      </div>
                      <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Mi Detalle en Nómina Específica</p>
                          <p className="text-xs text-gray-400 mt-0.5">Tu desglose de conceptos en una nómina</p>
                          <div className="mt-2">
                            <SearchSelect
                              options={nominas}
                              value={nominaSelUser}
                              onChange={setNominaSelUser}
                              placeholder="Seleccionar nómina"
                              labelKey={(n) => `#${n.id_nomina} — ${n.periodo} (${n.tipo})`}
                              valueKey={(n) => n.id_nomina}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => nominaSelUser && abrirPDF(`/reportes/nominas/${nominaSelUser}/empleado/${miEmpleado.id_empleado}`, "user-nomina-detalle")}
                          disabled={!nominaSelUser || generando === "user-nomina-detalle"}
                          className={btnClass(!nominaSelUser || generando === "user-nomina-detalle")}
                        >
                          <IconoPDF />{generando === "user-nomina-detalle" ? "Generando..." : "Generar PDF"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      Expediente
                    </h2>
                    <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">Mi Expediente</p>
                        <p className="text-xs text-gray-400 mt-0.5">Documentos subidos y estado de tu expediente</p>
                      </div>
                      <button onClick={() => abrirPDF(`/reportes/expedientes/${miEmpleado.id_empleado}`, "user-expediente")}
                        disabled={generando === "user-expediente"} className={btnClass(generando === "user-expediente")}>
                        <IconoPDF />{generando === "user-expediente" ? "Generando..." : "Generar PDF"}
                      </button>
                    </div>
                  </div>

                  <div className={cardClass}>
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                      </svg>
                      Información Académica
                    </h2>
                    <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                      <div>
                        <p className="text-sm font-medium">Mi Información Académica</p>
                        <p className="text-xs text-gray-400 mt-0.5">Títulos, certificaciones y documentos académicos</p>
                      </div>
                      <button onClick={() => abrirPDF(`/reportes/academicos/${miEmpleado.id_empleado}`, "user-academico")}
                        disabled={generando === "user-academico"} className={btnClass(generando === "user-academico")}>
                        <IconoPDF />{generando === "user-academico" ? "Generando..." : "Generar PDF"}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <p className="text-gray-500 font-medium">No tienes un perfil de empleado vinculado</p>
                  <p className="text-gray-400 text-sm mt-1">Contacta al administrador para acceder a tus reportes.</p>
                </div>
              )}
            </div>
          )}
        </main>
      )}
    </div>
  );
}