import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { fetchWithFallback } from "../../utils/api";
import { isAdmin } from "../../utils/auth";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

interface Nomina {
  id_nomina: number;
  periodo: string;
  tipo?: string;
  estado?: string;
}

interface Departamento {
  id_departamento: number;
  nombre_departamento: string;
}

interface MiPerfil {
  nombre_empleado: string;
  apellido_empleado: string;
  salario: number;
  estado: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const cargado = useRef(false);

  const [loadingAll, setLoadingAll] = useState(true);
  const [errorTimeout, setErrorTimeout] = useState(false);
  const [usuarios, setUsuarios] = useState(0);
  const [nominas, setNominas] = useState(0);
  const [nominasList, setNominasList] = useState<Nomina[]>([]);
  const [documentos, setDocumentos] = useState(0);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [miPerfil, setMiPerfil] = useState<MiPerfil | null>(null);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const rolDisplay = rol.toUpperCase();
  const esAdmin = isAdmin();
  const esRH = rol === "userrh";
  const esUser = rol === "user";

  useEffect(() => {
  if (cargado.current) return;
  cargado.current = true;

  const token = localStorage.getItem("token");
  if (!token) return;

  const headers = { Authorization: `Bearer ${token}` };
  const promesas: Promise<any>[] = [];

  let _usuarios = 0;
  let _nominas = 0;
  let _nominasList: Nomina[] = [];
  let _documentos = 0;
  let _empleados: Empleado[] = [];
  let _departamentos: Departamento[] = [];
  let _miPerfil: MiPerfil | null = null;

  if (esAdmin || esRH) {
    promesas.push(
      fetchWithFallback("/api/usuarios", { headers })
        .then((r) => r.json())
        .then((d) => { _usuarios = d.total; })
        .catch(() => {})
    );

    promesas.push(
      fetchWithFallback("/nomina", { headers })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            _nominas = d.length;
            _nominasList = d.slice(0, 3);
          }
        })
        .catch(() => {})
    );

    promesas.push(
      Promise.all([
        fetchWithFallback("/expediente/documentos", { headers }).then((r) => r.json()),
        fetchWithFallback("/academicos/documentos", { headers }).then((r) => r.json()),
      ])
        .then(([exp, acad]) => {
          _documentos =
            (Array.isArray(exp) ? exp.length : 0) +
            (Array.isArray(acad) ? acad.length : 0);
        })
        .catch(() => {})
    );

    promesas.push(
      fetchWithFallback("/empleados", { headers })
        .then((r) => r.json())
        .then((d) => { _empleados = Array.isArray(d) ? d : []; })
        .catch(() => {})
    );
  }

  if (esAdmin) {
    promesas.push(
      fetchWithFallback("/departamentos", { headers })
        .then((r) => r.json())
        .then((d) => { _departamentos = Array.isArray(d) ? d : []; })
        .catch(() => {})
    );
  }

  if (esUser) {
    promesas.push(
      fetchWithFallback("/nomina/mis-nominas", { headers })
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d)) {
            _nominas = d.length;
            _nominasList = d.slice(0, 3);
          }
        })
        .catch(() => {})
    );

    promesas.push(
      fetchWithFallback("/empleados/mi-perfil", { headers })
        .then((r) => r.json())
        .then((d) => {
          if (d?.id_empleado) {
            _miPerfil = {
              nombre_empleado: d.nombre_empleado,
              apellido_empleado: d.apellido_empleado,
              salario: d.salario,
              estado: d.estado,
            };
          }
        })
        .catch(() => {})
    );
  }

  const timeout = setTimeout(() => {
    setLoadingAll(false);
    setErrorTimeout(true);
  }, 15000);

  Promise.all(promesas).finally(() => {
    clearTimeout(timeout);
    setUsuarios(_usuarios);
    setNominas(_nominas);
    setNominasList(_nominasList);
    setDocumentos(_documentos);
    setEmpleados(_empleados);
    setDepartamentos(_departamentos);
    setMiPerfil(_miPerfil);
    setLoadingAll(false);
  });
  }, [rol]);

  const depColors = [
    { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
    { border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
    { border: "border-violet-200", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-400" },
    { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    { border: "border-rose-200", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-400" },
    { border: "border-cyan-200", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-400" },
  ];

  const estadoBadge = (e: string) => {
    if (e === "Activo") return "bg-green-100 text-green-700";
    if (e === "Suspendido") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loadingAll ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : errorTimeout ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="text-gray-600 font-medium">El servidor tardó demasiado en responder</p>
          <p className="text-gray-400 text-sm">Puede que el servidor remoto esté iniciando. Intenta de nuevo.</p>
          <button
            onClick={() => {
              setErrorTimeout(false);
              setLoadingAll(true);
              window.location.reload();
            }}
            className="mt-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">
          <h1 className="text-4xl font-bold mb-1">Dashboard de Recursos Humanos</h1>
          <p className="text-gray-500 mb-10">Bienvenido, {nombre} ({rolDisplay})</p>

          {/* ── ADMIN / RH ── */}
          {(esAdmin || esRH) && (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${esAdmin ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 mb-10`}>

                <button onClick={() => navigate("/empleados")}
                  className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition w-full"
                >
                  <div>
                    <p className="text-gray-500 text-sm mb-1">{esAdmin ? "Total Usuarios" : "Total Empleados"}</p>
                    <p className="text-4xl font-bold">{esAdmin ? usuarios : empleados.length}</p>
                    <p className="text-gray-400 text-sm mt-2">{esAdmin ? `Empleados: ${empleados.length}` : "Gestión de personal"}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                </button>

                <button onClick={() => navigate("/nomina")}
                  className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition w-full"
                >
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Nóminas Generadas</p>
                    <p className="text-4xl font-bold">{nominas}</p>
                    <p className="text-gray-400 text-sm mt-2">Gestión de pagos</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </button>

                {esAdmin && (
                  <button onClick={() => navigate("/configAreas")}
                    className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition w-full"
                  >
                    <div>
                      <p className="text-gray-500 text-sm mb-1">Áreas</p>
                      <p className="text-4xl font-bold">{departamentos.length}</p>
                      <p className="text-gray-400 text-sm mt-2">Configuradas en el sistema</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                    </div>
                  </button>
                )}

                <button onClick={() => navigate("/documentos")}
                  className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition w-full"
                >
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Documentos</p>
                    <p className="text-4xl font-bold">{documentos}</p>
                    <p className="text-gray-400 text-sm mt-2">Subidos al sistema</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                </button>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Últimas Nóminas</h3>
                    <button onClick={() => navigate("/nomina")} className="text-sm text-blue-600 hover:underline font-medium">
                      Ver todas →
                    </button>
                  </div>
                  {nominasList.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No hay nóminas generadas</p>
                  ) : (
                    <ul className="divide-y">
                      {nominasList.map((n) => (
                        <li key={n.id_nomina} className="py-3 flex justify-between">
                          <span className="font-medium">{n.periodo}</span>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            n.estado === "Procesada" ? "bg-green-100 text-green-700"
                            : n.estado === "Cerrada" ? "bg-gray-100 text-gray-600"
                            : "bg-yellow-100 text-yellow-700"
                          }`}>{n.estado}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {esAdmin ? (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Áreas Configuradas</h3>
                      <button onClick={() => navigate("/configAreas")} className="text-sm text-blue-600 hover:underline font-medium">
                        Gestionar →
                      </button>
                    </div>
                    {departamentos.length === 0 ? (
                      <div className="text-center py-6">
                        <p className="text-gray-400 mb-3">No hay áreas configuradas</p>
                        <button onClick={() => navigate("/configAreas")}
                          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Crear departamento
                        </button>
                      </div>
                    ) : (
                      <ul className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {departamentos.map((dep, i) => {
                          const color = depColors[i % depColors.length];
                          return (
                            <li key={dep.id_departamento}
                              className={`flex items-center justify-between border ${color.border} ${color.bg} rounded-lg px-4 py-2.5`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                                <span className={`text-sm font-medium ${color.text}`}>{dep.nombre_departamento}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: "Expediente", path: "/expediente", color: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
                        { label: "Información Académica", path: "/informacion-academica", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
                        { label: "Documentos", path: "/documentos", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-100" },
                      ].map((item) => (
                        <button key={item.path} onClick={() => navigate(item.path)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${item.color}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── USER ── */}
          {esUser && (
            <div className="flex flex-col gap-6">

              {miPerfil && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Mi Información</h2>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 text-xl font-bold">{miPerfil.nombre_empleado.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold">{miPerfil.nombre_empleado} {miPerfil.apellido_empleado}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge(miPerfil.estado)}`}>
                          {miPerfil.estado}
                        </span>
                        <span className="text-sm text-gray-500">
                          Salario: <span className="font-medium text-gray-800">Q {miPerfil.salario.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</span>
                        </span>
                      </div>
                    </div>
                    <button onClick={() => navigate("/miPerfil")}
                      className="text-sm text-blue-600 hover:underline font-medium shrink-0"
                    >
                      Ver perfil →
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <button onClick={() => navigate("/nomina")}
                  className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Mis Nóminas</p>
                    <p className="text-4xl font-bold">{nominas}</p>
                    <p className="text-gray-400 text-sm mt-2">Nóminas registradas</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1="12" y1="1" x2="12" y2="23" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </div>
                </button>

                <button onClick={() => navigate("/reportes")}
                  className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start text-left hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Mis Reportes</p>
                    <p className="text-4xl font-bold">PDF</p>
                    <p className="text-gray-400 text-sm mt-2">Genera tus reportes</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                </button>
              </div>

              {nominasList.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Últimas Nóminas</h3>
                    <button onClick={() => navigate("/nomina")} className="text-sm text-blue-600 hover:underline font-medium">
                      Ver todas →
                    </button>
                  </div>
                  <ul className="divide-y">
                    {nominasList.map((n) => (
                      <li key={n.id_nomina} className="py-3 flex justify-between">
                        <span className="font-medium">{n.periodo}</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          n.estado === "Procesada" ? "bg-green-100 text-green-700"
                          : n.estado === "Cerrada" ? "bg-gray-100 text-gray-600"
                          : "bg-yellow-100 text-yellow-700"
                        }`}>{n.estado}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: "Mi Perfil", path: "/miPerfil", color: "bg-blue-50 text-blue-700 hover:bg-blue-100",
                      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
                    { label: "Mis Nóminas", path: "/nomina", color: "bg-green-50 text-green-700 hover:bg-green-100",
                      icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> },
                    { label: "Mis Reportes", path: "/reportes", color: "bg-purple-50 text-purple-700 hover:bg-purple-100",
                      icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></> },
                  ].map((item) => (
                    <button key={item.path} onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${item.color}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {item.icon}
                      </svg>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      )}
    </div>
  );
}