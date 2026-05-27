import { useState, useEffect } from "react";
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

export default function Reportes() {
  const rol = localStorage.getItem("rol")?.toLowerCase() || "";
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  if (!isAdminOrRH() && !isUser()) return <Navigate to="/dashboard" replace />;

  const nombre = localStorage.getItem("nombre") || "Usuario";

  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState<string | null>(null);

  const [empSelAdmin, setEmpSelAdmin] = useState<number | "">("");
  const [nominaSelAdmin, setNominaSelAdmin] = useState<number | "">("");
  const [empNominaAdmin, setEmpNominaAdmin] = useState<number | "">("");

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

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        if (isAdminOrRH()) {
          const [empsRes, nominasRes] = await Promise.all([
            fetchWithFallback("/empleados", { headers }).then(r => r.json()),
            fetchWithFallback("/nomina", { headers }).then(r => r.json()),
          ]);
          setEmpleados(Array.isArray(empsRes) ? empsRes : []);
          setNominas(Array.isArray(nominasRes) ? nominasRes : []);
        } else {
          const [perfilRes, nominasRes] = await Promise.all([
            fetchWithFallback("/empleados/mi-perfil", { headers }).then(r => r.json()),
            fetchWithFallback("/nomina/mis-nominas", { headers }).then(r => r.json()),
          ]);
          if (perfilRes?.id_empleado) setMiEmpleado(perfilRes);
          setNominas(Array.isArray(nominasRes) ? nominasRes : []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const abrirPDF = async (endpoint: string, key: string) => {
    setGenerando(key);
    try {
      const base = await getBase();
      window.open(`${base}${endpoint}`, "_blank");
    } catch {
      alert("No se pudo generar el reporte.");
    } finally {
      setGenerando(null);
    }
  };

  const btnClass = (disabled: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
      disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-blue-600 text-white hover:bg-blue-700"
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
                    <button
                      onClick={() => abrirPDF("/reportes/nominas", "nominas-general")}
                      disabled={generando === "nominas-general"}
                      className={btnClass(generando === "nominas-general")}
                    >
                      <IconoPDF />
                      {generando === "nominas-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Nómina Específica</p>
                      <p className="text-xs text-gray-400 mt-0.5">Reporte detallado de una nómina</p>
                      <select
                        value={nominaSelAdmin}
                        onChange={(e) => setNominaSelAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar nómina</option>
                        {nominas.map((n) => (
                          <option key={n.id_nomina} value={n.id_nomina}>#{n.id_nomina} — {n.periodo} ({n.tipo})</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => nominaSelAdmin && abrirPDF(`/reportes/nominas/${nominaSelAdmin}`, "nomina-id")}
                      disabled={!nominaSelAdmin || generando === "nomina-id"}
                      className={btnClass(!nominaSelAdmin || generando === "nomina-id")}
                    >
                      <IconoPDF />
                      {generando === "nomina-id" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Historial de Nóminas por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Todas las nóminas en las que ha participado un empleado</p>
                      <select
                        value={empSelAdmin}
                        onChange={(e) => setEmpSelAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar empleado</option>
                        {empleados.map((emp) => (
                          <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => empSelAdmin && abrirPDF(`/reportes/nominas/empleado/${empSelAdmin}`, "nomina-empleado")}
                      disabled={!empSelAdmin || generando === "nomina-empleado"}
                      className={btnClass(!empSelAdmin || generando === "nomina-empleado")}
                    >
                      <IconoPDF />
                      {generando === "nomina-empleado" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Detalle de Empleado en Nómina</p>
                      <p className="text-xs text-gray-400 mt-0.5">Detalle específico de un empleado en una nómina</p>
                      <div className="flex gap-2 mt-2">
                        <select
                          value={nominaSelAdmin}
                          onChange={(e) => setNominaSelAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Nómina</option>
                          {nominas.map((n) => (
                            <option key={n.id_nomina} value={n.id_nomina}>#{n.id_nomina} — {n.periodo}</option>
                          ))}
                        </select>
                        <select
                          value={empNominaAdmin}
                          onChange={(e) => setEmpNominaAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Empleado</option>
                          {empleados.map((emp) => (
                            <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => nominaSelAdmin && empNominaAdmin && abrirPDF(`/reportes/nominas/${nominaSelAdmin}/empleado/${empNominaAdmin}`, "nomina-detalle-emp")}
                      disabled={!nominaSelAdmin || !empNominaAdmin || generando === "nomina-detalle-emp"}
                      className={btnClass(!nominaSelAdmin || !empNominaAdmin || generando === "nomina-detalle-emp")}
                    >
                      <IconoPDF />
                      {generando === "nomina-detalle-emp" ? "Generando..." : "Generar PDF"}
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
                    <button
                      onClick={() => abrirPDF("/reportes/expedientes", "expedientes-general")}
                      disabled={generando === "expedientes-general"}
                      className={btnClass(generando === "expedientes-general")}
                    >
                      <IconoPDF />
                      {generando === "expedientes-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Expediente por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Documentos subidos y faltantes de un empleado</p>
                      <select
                        value={empSelAdmin}
                        onChange={(e) => setEmpSelAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar empleado</option>
                        {empleados.map((emp) => (
                          <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => empSelAdmin && abrirPDF(`/reportes/expedientes/${empSelAdmin}`, "expediente-emp")}
                      disabled={!empSelAdmin || generando === "expediente-emp"}
                      className={btnClass(!empSelAdmin || generando === "expediente-emp")}
                    >
                      <IconoPDF />
                      {generando === "expediente-emp" ? "Generando..." : "Generar PDF"}
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
                    <button
                      onClick={() => abrirPDF("/reportes/academicos", "academicos-general")}
                      disabled={generando === "academicos-general"}
                      className={btnClass(generando === "academicos-general")}
                    >
                      <IconoPDF />
                      {generando === "academicos-general" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Académico por Empleado</p>
                      <p className="text-xs text-gray-400 mt-0.5">Títulos, certificaciones y documentos académicos</p>
                      <select
                        value={empSelAdmin}
                        onChange={(e) => setEmpSelAdmin(e.target.value === "" ? "" : Number(e.target.value))}
                        className="mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccionar empleado</option>
                        {empleados.map((emp) => (
                          <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={() => empSelAdmin && abrirPDF(`/reportes/academicos/${empSelAdmin}`, "academico-emp")}
                      disabled={!empSelAdmin || generando === "academico-emp"}
                      className={btnClass(!empSelAdmin || generando === "academico-emp")}
                    >
                      <IconoPDF />
                      {generando === "academico-emp" ? "Generando..." : "Generar PDF"}
                    </button>
                  </div>

                </div>
              </div>

            </div>
          ) : (
            // VISTA USER
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

                  {/* Nóminas user */}
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
                        <button
                          onClick={() => abrirPDF(`/reportes/nominas/empleado/${miEmpleado.id_empleado}`, "user-nominas")}
                          disabled={generando === "user-nominas"}
                          className={btnClass(generando === "user-nominas")}
                        >
                          <IconoPDF />
                          {generando === "user-nominas" ? "Generando..." : "Generar PDF"}
                        </button>
                      </div>

                      <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3 gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Mi Detalle en Nómina Específica</p>
                          <p className="text-xs text-gray-400 mt-0.5">Tu desglose de conceptos en una nómina</p>
                          <select
                            value={nominaSelUser}
                            onChange={(e) => setNominaSelUser(e.target.value === "" ? "" : Number(e.target.value))}
                            className="mt-2 border border-gray-300 rounded-md px-3 py-1.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Seleccionar nómina</option>
                            {nominas.map((n) => (
                              <option key={n.id_nomina} value={n.id_nomina}>#{n.id_nomina} — {n.periodo} ({n.tipo})</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => nominaSelUser && abrirPDF(`/reportes/nominas/${nominaSelUser}/empleado/${miEmpleado.id_empleado}`, "user-nomina-detalle")}
                          disabled={!nominaSelUser || generando === "user-nomina-detalle"}
                          className={btnClass(!nominaSelUser || generando === "user-nomina-detalle")}
                        >
                          <IconoPDF />
                          {generando === "user-nomina-detalle" ? "Generando..." : "Generar PDF"}
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Expediente user */}
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
                      <button
                        onClick={() => abrirPDF(`/reportes/expedientes/${miEmpleado.id_empleado}`, "user-expediente")}
                        disabled={generando === "user-expediente"}
                        className={btnClass(generando === "user-expediente")}
                      >
                        <IconoPDF />
                        {generando === "user-expediente" ? "Generando..." : "Generar PDF"}
                      </button>
                    </div>
                  </div>

                  {/* Académico user */}
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
                      <button
                        onClick={() => abrirPDF(`/reportes/academicos/${miEmpleado.id_empleado}`, "user-academico")}
                        disabled={generando === "user-academico"}
                        className={btnClass(generando === "user-academico")}
                      >
                        <IconoPDF />
                        {generando === "user-academico" ? "Generando..." : "Generar PDF"}
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