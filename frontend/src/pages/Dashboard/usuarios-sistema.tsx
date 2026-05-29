import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  rol: string;
  id_empleado: number | null;
}

const rolBadge = (rol: string) => {
  if (rol === "admin") return "bg-purple-100 text-purple-700";
  if (rol === "UserRH") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-600";
};

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  if (typeof err.error === "string") return err.error;
  return "Error desconocido";
};

const CACHE_KEY = "cache_usuarios_sistema";
const CACHE_TTL = 5 * 60 * 1000;

export default function UsuariosSistema() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const navigate = useNavigate();
  const cargado = useRef(false);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModalUser, setMostrarModalUser] = useState(false);
  const [userForm, setUserForm] = useState({ nombre: "", password: "", rol: "user" });
  const [guardandoUser, setGuardandoUser] = useState(false);
  const [errorUser, setErrorUser] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
          setUsuarios(data.usuarios);
          setEmpleados(data.empleados);
          setLoading(false);
          return;
        }
        sessionStorage.removeItem(CACHE_KEY);
      }
    }
    setLoading(true);
    Promise.all([
      fetchWithFallback("/api/usuarios/lista", { headers }).then((r) => r.json()),
      fetchWithFallback("/empleados", { headers }).then((r) => r.json()),
    ])
      .then(([usrs, emps]) => {
        const usuarios = Array.isArray(usrs) ? usrs : [];
        const empleados = Array.isArray(emps) ? emps : [];
        setUsuarios(usuarios);
        setEmpleados(empleados);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          _expires: Date.now() + CACHE_TTL,
          usuarios, empleados,
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

  const empleadosLibres = empleados.filter(
    (emp) => !usuarios.some((u) => u.id_empleado === emp.id_empleado)
  );

  const getNombreEmpleado = (id: number | null) => {
    if (!id) return null;
    const emp = empleados.find((e) => e.id_empleado === id);
    return emp ? `${emp.nombre_empleado} ${emp.apellido_empleado}` : null;
  };

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
      setUserForm({ nombre: "", password: "", rol: "user" });
      limpiarCache();
      cargarDatos(true);
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
      limpiarCache();
      cargarDatos(true);
    } catch (e: any) {
      alert(e.message || "No se pudo vincular.");
    } finally {
      setGuardandoVinculo(false);
    }
  };

  const handleDesvincular = async (id_usuario: number) => {
    if (!confirm("¿Desvincular empleado de este usuario?")) return;
    try {
      const res = await fetchWithFallback(`/api/usuarios/${id_usuario}/empleado`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      limpiarCache();
      cargarDatos(true);
    } catch (e: any) {
      alert(e.message || "No se pudo desvincular.");
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda.trim()) return true;
    const q = busqueda.toLowerCase();
    return u.nombre.toLowerCase().includes(q) || u.rol.toLowerCase().includes(q);
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/empleados")}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M19 12H5" /><path d="M12 5l-7 7 7 7" />
                </svg>
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h1 className="text-3xl font-bold">Usuarios del Sistema</h1>
            </div>
            <button
              onClick={() => setMostrarModalUser(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Buscar por nombre o rol..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {usuariosFiltrados.length === 0 ? (
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
        </main>
      )}

      {/* Modal Nuevo Usuario */}
      {mostrarModalUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Nuevo Usuario</h3>
              <button onClick={() => { setMostrarModalUser(false); setUserForm({ nombre: "", password: "", rol: "user" }); setErrorUser(""); }} className="text-gray-400 hover:text-gray-600 transition">
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
                  <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)}
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
              <button onClick={() => { setMostrarModalUser(false); setUserForm({ nombre: "", password: "", rol: "user" }); setErrorUser(""); }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vincular */}
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
            <select value={empSeleccionado}
              onChange={(e) => setEmpSeleccionado(Number(e.target.value))}
              className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
            >
              <option value="">— Seleccionar —</option>
              {empleadosLibres.map((emp) => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre_empleado} {emp.apellido_empleado}
                </option>
              ))}
            </select>
            {empleadosLibres.length === 0 && (
              <p className="text-xs text-amber-600 mb-4">Todos los empleados ya están vinculados.</p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={handleVincular} disabled={guardandoVinculo || !empSeleccionado}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardandoVinculo ? "Vinculando..." : "Vincular"}
              </button>
              <button onClick={() => { setModalVincular(null); setEmpSeleccionado(""); }}
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