import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
  id_departamento: number;
}

type EstadoEmpleado = "Activo" | "Suspendido" | "Retirado";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
  dpi: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  salario: number;
  estado: EstadoEmpleado;
  id_departamento: number;
  id_puesto: number;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  rol: string;
  id_empleado: number | null;
}

const estadoBadge = (estado: string) => {
  if (estado === "Activo") return "bg-green-100 text-green-700";
  if (estado === "Suspendido") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

const rolBadge = (rol: string) => {
  if (rol === "admin") return "bg-purple-100 text-purple-700";
  if (rol === "UserRH") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const emptyForm = {
  nombre_empleado: "",
  apellido_empleado: "",
  dpi: "",
  fecha_nacimiento: "",
  direccion: "",
  telefono: "",
  correo: "",
  salario: "",
  estado: "Activo" as EstadoEmpleado,
  id_departamento: "",
  id_puesto: "",
};

type FormType = typeof emptyForm;

const emptyUserForm = {
  nombre: "",
  password: "",
  rol: "user",
};

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  if (typeof err.error === "string") return err.error;
  return "Error desconocido";
};

const inputClass = (error?: string) =>
  `border rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? "border-red-400" : "border-gray-300"
  }`;

const formatDPI = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 4) return digits;
  if (digits.length <= 9) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 9)}-${digits.slice(9)}`;
};

const formatTelefono = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
};

const soloDigitos = (value: string) => value.replace(/\D/g, "");

const hoy = new Date();
const maxFecha = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate())
  .toISOString().split("T")[0];
const minFecha = new Date(hoy.getFullYear() - 100, hoy.getMonth(), hoy.getDate())
  .toISOString().split("T")[0];

type VistaActiva = "empleados" | "usuarios";

export default function Empleados() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("empleados");

  // ── Empleados ──
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | EstadoEmpleado>("todos");
  const [filtroDep, setFiltroDep] = useState<number | "todos">("todos");
  const [mostrarModalEmp, setMostrarModalEmp] = useState(false);
  const [editando, setEditando] = useState<Empleado | null>(null);
  const [form, setForm] = useState<FormType>(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [errorGlobal, setErrorGlobal] = useState("");

  // ── Usuarios ──
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [busquedaUser, setBusquedaUser] = useState("");
  const [mostrarModalUser, setMostrarModalUser] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [guardandoUser, setGuardandoUser] = useState(false);
  const [errorUser, setErrorUser] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  // ── Vincular ──
  const [modalVincular, setModalVincular] = useState<Usuario | null>(null);
  const [empSeleccionado, setEmpSeleccionado] = useState<number | "">("");
  const [guardandoVinculo, setGuardandoVinculo] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const cargarDatos = () => {
    setLoading(true);
    Promise.all([
      fetchWithFallback("/empleados", { headers }).then((r) => r.json()),
      fetchWithFallback("/departamentos", { headers }).then((r) => r.json()),
      fetchWithFallback("/puestos", { headers }).then((r) => r.json()),
    ])
      .then(([emps, deps, psts]) => {
        setEmpleados(Array.isArray(emps) ? emps : []);
        setDepartamentos(Array.isArray(deps) ? deps : []);
        setPuestos(Array.isArray(psts) ? psts : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const cargarUsuarios = () => {
    setLoadingUsuarios(true);
    fetchWithFallback("/api/usuarios/lista", { headers })
      .then((r) => r.json())
      .then((d) => setUsuarios(Array.isArray(d) ? d : []))
      .catch(() => setUsuarios([]))
      .finally(() => setLoadingUsuarios(false));
  };

  useEffect(() => {
    cargarDatos();
    cargarUsuarios();
  }, []);

  const puestosFiltrados = puestos.filter(
    (p) => p.id_departamento === Number(form.id_departamento)
  );

  const validar = () => {
    const e: Record<string, string> = {};
    if (!form.nombre_empleado.trim()) e.nombre_empleado = "El nombre es obligatorio";
    if (!form.apellido_empleado.trim()) e.apellido_empleado = "El apellido es obligatorio";
    if (soloDigitos(form.dpi).length !== 13) e.dpi = "El DPI debe tener exactamente 13 dígitos";
    if (!form.fecha_nacimiento) {
      e.fecha_nacimiento = "La fecha de nacimiento es obligatoria";
    } else if (form.fecha_nacimiento > maxFecha) {
      e.fecha_nacimiento = "El empleado debe tener al menos 18 años";
    } else if (form.fecha_nacimiento < minFecha) {
      e.fecha_nacimiento = "La fecha no puede ser mayor a 100 años atrás";
    }
    if (!form.direccion.trim()) e.direccion = "La dirección es obligatoria";
    if (soloDigitos(form.telefono).length !== 8) e.telefono = "El teléfono debe tener 8 dígitos válidos";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) e.correo = "Debe ser un correo válido";
    if (!form.salario || Number(form.salario) < 0 || !Number.isInteger(Number(form.salario))) {
      e.salario = "El salario debe ser un número entero positivo";
    }
    if (!form.id_departamento) e.id_departamento = "Selecciona un departamento";
    if (!form.id_puesto) e.id_puesto = "Selecciona un puesto";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const setField = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errores[field]) {
      setErrores((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const abrirCrearEmp = () => {
    setEditando(null);
    setForm(emptyForm);
    setErrores({});
    setErrorGlobal("");
    setMostrarModalEmp(true);
  };

  const abrirEditarEmp = (emp: Empleado) => {
    setEditando(emp);
    setForm({
      nombre_empleado: emp.nombre_empleado,
      apellido_empleado: emp.apellido_empleado,
      dpi: formatDPI(soloDigitos(emp.dpi)),
      fecha_nacimiento: emp.fecha_nacimiento ? emp.fecha_nacimiento.split("T")[0] : "",
      direccion: emp.direccion,
      telefono: formatTelefono(soloDigitos(emp.telefono)),
      correo: emp.correo,
      salario: String(emp.salario),
      estado: emp.estado,
      id_departamento: String(emp.id_departamento),
      id_puesto: String(emp.id_puesto),
    });
    setErrores({});
    setErrorGlobal("");
    setMostrarModalEmp(true);
  };

  const handleGuardarEmp = async () => {
    if (!validar()) return;
    setGuardando(true);
    setErrorGlobal("");
    try {
      const body = {
        nombre_empleado: form.nombre_empleado.trim(),
        apellido_empleado: form.apellido_empleado.trim(),
        dpi: soloDigitos(form.dpi),
        fecha_nacimiento: `${form.fecha_nacimiento}T12:00:00.000Z`,
        direccion: form.direccion.trim(),
        telefono: soloDigitos(form.telefono),
        correo: form.correo.trim(),
        salario: Number(form.salario),
        estado: form.estado,
        id_departamento: Number(form.id_departamento),
        id_puesto: Number(form.id_puesto),
      };

      const res = editando
        ? await fetchWithFallback(`/empleados/${editando.id_empleado}`, { method: "PUT", headers, body: JSON.stringify(body) })
        : await fetchWithFallback("/empleados", { method: "POST", headers, body: JSON.stringify(body) });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(parseError(err));
      }
      setMostrarModalEmp(false);
      cargarDatos();
    } catch (e: any) {
      setErrorGlobal(e.message || "No se pudo guardar el empleado.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminarEmp = async (id: number) => {
    if (!confirm("¿Eliminar este empleado?")) return;
    try {
      const res = await fetchWithFallback(`/empleados/${id}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      cargarDatos();
    } catch (e: any) {
      alert(e.message || "No se pudo eliminar el empleado.");
    }
  };

  const handleCambiarEstado = async (id: number, estado: string) => {
    try {
      const res = await fetchWithFallback(`/empleados/${id}/estado`, { method: "PATCH", headers, body: JSON.stringify({ estado }) });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      cargarDatos();
    } catch (e: any) {
      alert(e.message || "No se pudo cambiar el estado.");
    }
  };

  // ── Usuarios ──
  const handleCrearUsuario = async () => {
    if (!userForm.nombre.trim()) { setErrorUser("El nombre es obligatorio"); return; }
    if (!userForm.password.trim()) { setErrorUser("La contraseña es obligatoria"); return; }
    setGuardandoUser(true);
    setErrorUser("");
    try {
      const res = await fetchWithFallback("/auth/register", {
        method: "POST",
        headers,
        body: JSON.stringify(userForm),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setMostrarModalUser(false);
      setUserForm(emptyUserForm);
      cargarUsuarios();
    } catch (e: any) {
      setErrorUser(e.message || "No se pudo crear el usuario.");
    } finally {
      setGuardandoUser(false);
    }
  };

  const handleVincular = async () => {
    if (!modalVincular || !empSeleccionado) return;
    setGuardandoVinculo(true);
    try {
      const res = await fetchWithFallback(`/api/usuarios/${modalVincular.id_usuario}/empleado`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ id_empleado: Number(empSeleccionado) }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setModalVincular(null);
      setEmpSeleccionado("");
      cargarUsuarios();
    } catch (e: any) {
      alert(e.message || "No se pudo vincular.");
    } finally {
      setGuardandoVinculo(false);
    }
  };

  const handleDesvincular = async (id_usuario: number) => {
    if (!confirm("¿Desvincular empleado de este usuario?")) return;
    try {
      const res = await fetchWithFallback(`/api/usuarios/${id_usuario}/empleado`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      cargarUsuarios();
    } catch (e: any) {
      alert(e.message || "No se pudo desvincular.");
    }
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    if (filtroEstado !== "todos" && emp.estado !== filtroEstado) return false;
    if (filtroDep !== "todos" && emp.id_departamento !== filtroDep) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        emp.nombre_empleado.toLowerCase().includes(q) ||
        emp.apellido_empleado.toLowerCase().includes(q) ||
        emp.correo.toLowerCase().includes(q) ||
        emp.dpi.includes(q)
      );
    }
    return true;
  });

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busquedaUser.trim()) return true;
    const q = busquedaUser.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q);
  });

  // Empleados sin usuario vinculado (para el select de vincular)
  const empleadosLibres = empleados.filter(
    (emp) => !usuarios.some((u) => u.id_empleado === emp.id_empleado)
  );

  const getNombreDep = (id: number) =>
    departamentos.find((d) => d.id_departamento === id)?.nombre_departamento || "—";
  const getNombrePuesto = (id: number) =>
    puestos.find((p) => p.id_puesto === id)?.nombre_puesto || "—";
  const getNombreEmpleado = (id: number | null) => {
    if (!id) return null;
    const emp = empleados.find((e) => e.id_empleado === id);
    return emp ? `${emp.nombre_empleado} ${emp.apellido_empleado}` : null;
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading && loadingUsuarios ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">

          {/* Título + tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h1 className="text-3xl font-bold">Gestión de Personal</h1>
            </div>
            <button
              onClick={() => vistaActiva === "empleados" ? abrirCrearEmp() : setMostrarModalUser(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {vistaActiva === "empleados" ? "Nuevo Empleado" : "Nuevo Usuario"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1 w-fit">
            <button
              onClick={() => setVistaActiva("empleados")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                vistaActiva === "empleados" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Empleados
            </button>
            <button
              onClick={() => setVistaActiva("usuarios")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
                vistaActiva === "usuarios" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Usuarios del Sistema
            </button>
          </div>

          {/* ══ VISTA EMPLEADOS ══ */}
          {vistaActiva === "empleados" && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" placeholder="Buscar por nombre, correo, DPI..."
                    value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                    className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-1">
                  {(["todos", "Activo", "Suspendido", "Retirado"] as const).map((e) => (
                    <button key={e} onClick={() => setFiltroEstado(e)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition border ${
                        filtroEstado === e ? estadoBadge(e) + " border-current" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {e === "todos" ? "Todos" : e}
                    </button>
                  ))}
                </div>
                <select value={filtroDep}
                  onChange={(e) => setFiltroDep(e.target.value === "todos" ? "todos" : Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                >
                  <option value="todos">Todos los departamentos</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>{d.nombre_departamento}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-400 ml-auto">
                  {empleadosFiltrados.length} empleado{empleadosFiltrados.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {empleadosFiltrados.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 mb-4">No hay empleados registrados</p>
                    <button onClick={abrirCrearEmp} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Crear primer empleado
                    </button>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="p-4 text-left font-medium">Nombre</th>
                        <th className="p-4 text-left font-medium">DPI</th>
                        <th className="p-4 text-left font-medium">Correo</th>
                        <th className="p-4 text-left font-medium">Departamento</th>
                        <th className="p-4 text-left font-medium">Puesto</th>
                        <th className="p-4 text-left font-medium">Salario</th>
                        <th className="p-4 text-left font-medium">Estado</th>
                        <th className="p-4 text-center font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empleadosFiltrados.map((emp) => {
                        const usuarioVinculado = usuarios.find((u) => u.id_empleado === emp.id_empleado);
                        return (
                          <tr key={emp.id_empleado} className="border-t hover:bg-gray-50 transition">
                            <td className="p-4">
                              <p className="font-medium text-sm">{emp.nombre_empleado} {emp.apellido_empleado}</p>
                              <p className="text-xs text-gray-400">{formatTelefono(soloDigitos(emp.telefono))}</p>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{formatDPI(soloDigitos(emp.dpi))}</td>
                            <td className="p-4 text-sm text-gray-600">{emp.correo}</td>
                            <td className="p-4 text-sm text-gray-600">{getNombreDep(emp.id_departamento)}</td>
                            <td className="p-4 text-sm text-gray-600">{getNombrePuesto(emp.id_puesto)}</td>
                            <td className="p-4 text-sm font-medium text-gray-700">
                              Q {emp.salario.toLocaleString("es-GT", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="p-4">
                              <select value={emp.estado}
                                onChange={(e) => handleCambiarEstado(emp.id_empleado, e.target.value)}
                                className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer ${estadoBadge(emp.estado)}`}
                              >
                                <option value="Activo">Activo</option>
                                <option value="Suspendido">Suspendido</option>
                                <option value="Retirado">Retirado</option>
                              </select>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => abrirEditarEmp(emp)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                                <button onClick={() => handleEliminarEmp(emp.id_empleado)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
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
            </>
          )}

          {/* ══ VISTA USUARIOS ══ */}
          {vistaActiva === "usuarios" && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input type="text" placeholder="Buscar por nombre o rol..."
                    value={busquedaUser} onChange={(e) => setBusquedaUser(e.target.value)}
                    className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <span className="text-sm text-gray-400 ml-auto">
                  {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {loadingUsuarios ? (
                  <p className="text-gray-400 text-center py-10">Cargando...</p>
                ) : usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-400 mb-4">No hay usuarios registrados</p>
                    <button onClick={() => setMostrarModalUser(true)} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Crear primer usuario
                    </button>
                  </div>
                ) : (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                        <th className="p-4 text-left font-medium">ID</th>
                        <th className="p-4 text-left font-medium">Nombre</th>
                        <th className="p-4 text-left font-medium">Rol</th>
                        <th className="p-4 text-left font-medium">Empleado Vinculado</th>
                        <th className="p-4 text-center font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuariosFiltrados.map((u) => {
                        const empNombre = getNombreEmpleado(u.id_empleado);
                        return (
                          <tr key={u.id_usuario} className="border-t hover:bg-gray-50 transition">
                            <td className="p-4 text-sm text-gray-500">#{u.id_usuario}</td>
                            <td className="p-4 font-medium text-sm">{u.nombre}</td>
                            <td className="p-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${rolBadge(u.rol)}`}>
                                {u.rol}
                              </span>
                            </td>
                            <td className="p-4">
                              {empNombre ? (
                                <span className="text-sm text-gray-700 font-medium">{empNombre}</span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Sin vincular</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-2">
                                {u.id_empleado ? (
                                  <button
                                    onClick={() => handleDesvincular(u.id_usuario)}
                                    className="text-xs text-red-600 hover:text-red-800 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition flex items-center gap-1"
                                    title="Desvincular empleado"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                      <line x1="4" y1="4" x2="20" y2="20" />
                                    </svg>
                                    Desvincular
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => { setModalVincular(u); setEmpSeleccionado(""); }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition flex items-center gap-1"
                                    title="Vincular empleado"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                    Vincular
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </main>
      )}

      {/* ══ Modal Empleado ══ */}
      {mostrarModalEmp && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">{editando ? "Editar Empleado" : "Nuevo Empleado"}</h3>
              <button onClick={() => setMostrarModalEmp(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {errorGlobal && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorGlobal}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" placeholder="Juan" value={form.nombre_empleado}
                  onChange={(e) => setField("nombre_empleado", e.target.value)}
                  className={inputClass(errores.nombre_empleado)} />
                {errores.nombre_empleado && <p className="text-xs text-red-500 mt-0.5">{errores.nombre_empleado}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input type="text" placeholder="Pérez" value={form.apellido_empleado}
                  onChange={(e) => setField("apellido_empleado", e.target.value)}
                  className={inputClass(errores.apellido_empleado)} />
                {errores.apellido_empleado && <p className="text-xs text-red-500 mt-0.5">{errores.apellido_empleado}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">DPI</label>
                <input type="text" placeholder="1234-12345-1234" value={form.dpi} maxLength={15}
                  onChange={(e) => setField("dpi", formatDPI(e.target.value))}
                  className={inputClass(errores.dpi)} />
                {errores.dpi && <p className="text-xs text-red-500 mt-0.5">{errores.dpi}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input type="date" value={form.fecha_nacimiento} min={minFecha} max={maxFecha}
                  onChange={(e) => setField("fecha_nacimiento", e.target.value)}
                  className={inputClass(errores.fecha_nacimiento)} />
                {errores.fecha_nacimiento && <p className="text-xs text-red-500 mt-0.5">{errores.fecha_nacimiento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input type="text" placeholder="1234-1234" value={form.telefono} maxLength={9}
                  onChange={(e) => setField("telefono", formatTelefono(e.target.value))}
                  className={inputClass(errores.telefono)} />
                {errores.telefono && <p className="text-xs text-red-500 mt-0.5">{errores.telefono}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                <input type="email" placeholder="correo@ejemplo.com" value={form.correo}
                  onChange={(e) => setField("correo", e.target.value)}
                  className={inputClass(errores.correo)} />
                {errores.correo && <p className="text-xs text-red-500 mt-0.5">{errores.correo}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input type="text" placeholder="Ciudad, País" value={form.direccion}
                  onChange={(e) => setField("direccion", e.target.value)}
                  className={inputClass(errores.direccion)} />
                {errores.direccion && <p className="text-xs text-red-500 mt-0.5">{errores.direccion}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Salario (Q)</label>
                <input type="number" placeholder="3000" value={form.salario} min="0" step="1"
                  onChange={(e) => setField("salario", String(Math.floor(Math.max(0, Number(e.target.value)))))}
                  className={inputClass(errores.salario)} />
                {errores.salario && <p className="text-xs text-red-500 mt-0.5">{errores.salario}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select value={form.estado}
                  onChange={(e) => setForm((prev) => ({ ...prev, estado: e.target.value as EstadoEmpleado }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Activo">Activo</option>
                  <option value="Suspendido">Suspendido</option>
                  <option value="Retirado">Retirado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select value={form.id_departamento}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, id_departamento: e.target.value, id_puesto: "" }));
                    setErrores((prev) => { const n = { ...prev }; delete n.id_departamento; return n; });
                  }}
                  className={inputClass(errores.id_departamento)}
                >
                  <option value="">Seleccionar departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>{d.nombre_departamento}</option>
                  ))}
                </select>
                {errores.id_departamento && <p className="text-xs text-red-500 mt-0.5">{errores.id_departamento}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Puesto</label>
                <select value={form.id_puesto}
                  onChange={(e) => setField("id_puesto", e.target.value)}
                  disabled={!form.id_departamento}
                  className={`${inputClass(errores.id_puesto)} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="">Seleccionar puesto</option>
                  {puestosFiltrados.map((p) => (
                    <option key={p.id_puesto} value={p.id_puesto}>{p.nombre_puesto}</option>
                  ))}
                </select>
                {errores.id_puesto && <p className="text-xs text-red-500 mt-0.5">{errores.id_puesto}</p>}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={handleGuardarEmp} disabled={guardando}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardando ? "Guardando..." : editando ? "Actualizar" : "Crear Empleado"}
              </button>
              <button onClick={() => setMostrarModalEmp(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal Nuevo Usuario ══ */}
      {mostrarModalUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Nuevo Usuario</h3>
              <button onClick={() => { setMostrarModalUser(false); setUserForm(emptyUserForm); setErrorUser(""); }} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {errorUser && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorUser}</div>
            )}

            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
                <input type="text" placeholder="nombre_usuario" value={userForm.nombre}
                  onChange={(e) => setUserForm((p) => ({ ...p, nombre: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <div className="relative">
                  <input
                    type={mostrarPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))}
                    className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassword(!mostrarPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {mostrarPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select value={userForm.rol}
                  onChange={(e) => setUserForm((p) => ({ ...p, rol: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">user</option>
                  <option value="UserRH">UserRH</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCrearUsuario} disabled={guardandoUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardandoUser ? "Creando..." : "Crear Usuario"}
              </button>
              <button onClick={() => { setMostrarModalUser(false); setUserForm(emptyUserForm); setErrorUser(""); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Modal Vincular Empleado ══ */}
      {modalVincular && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Vincular Empleado</h3>
              <button onClick={() => { setModalVincular(null); setEmpSeleccionado(""); }} className="text-gray-400 hover:text-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Usuario: <span className="font-medium text-gray-800">{modalVincular.nombre}</span>
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Empleado</label>
            <select
              value={empSeleccionado}
              onChange={(e) => setEmpSeleccionado(Number(e.target.value))}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
            >
              <option value="">— Seleccionar —</option>
              {empleadosLibres.map((emp) => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre_empleado} {emp.apellido_empleado}
                </option>
              ))}
            </select>

            {empleadosLibres.length === 0 && (
              <p className="text-xs text-amber-600 mb-4">Todos los empleados ya están vinculados a un usuario.</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleVincular}
                disabled={guardandoVinculo || !empSeleccionado}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardandoVinculo ? "Vinculando..." : "Vincular"}
              </button>
              <button
                onClick={() => { setModalVincular(null); setEmpSeleccionado(""); }}
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