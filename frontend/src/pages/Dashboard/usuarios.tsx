import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdmin } from "../../utils/auth";
import { fetchWithFallback } from "../../utils/api";

interface Usuario {
  id_usuario: number;
  nombre: string;
  rol: string;
  id_empleado: number | null;
}

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
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

const emptyUserForm = {
  nombre: "",
  password: "",
  rol: "user",
};

export default function Usuarios() {
  if (!isAdmin()) return <Navigate to="/dashboard" replace />;

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModalUser, setMostrarModalUser] = useState(false);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [guardandoUser, setGuardandoUser] = useState(false);
  const [errorUser, setErrorUser] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [modalVincular, setModalVincular] = useState<Usuario | null>(null);
  const [empSeleccionado, setEmpSeleccionado] = useState<number | "">("");
  const [guardandoVinculo, setGuardandoVinculo] = useState(false);

  const [confirmDesvincular, setConfirmDesvincular] =
    useState<Usuario | null>(null);

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"success" | "error">(
    "success"
  );

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const mostrarMensaje = (
    texto: string,
    tipo: "success" | "error"
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);

    setTimeout(() => {
      setMensaje("");
    }, 4000);
  };

  const cargarUsuarios = async () => {
    try {
      setLoading(true);

      const [usuariosRes, empleadosRes] = await Promise.all([
        fetchWithFallback("/api/usuarios/lista", {
          method: "GET",
          headers,
        }),

        fetchWithFallback("/empleados", {
          method: "GET",
          headers,
        }),
      ]);

      const usuariosData = usuariosRes.ok
        ? await usuariosRes.json()
        : [];

      const empleadosData = empleadosRes.ok
        ? await empleadosRes.json()
        : [];

      setUsuarios(
        Array.isArray(usuariosData) ? usuariosData : []
      );

      setEmpleados(
        Array.isArray(empleadosData) ? empleadosData : []
      );
    } catch (error) {
      console.error(error);

      mostrarMensaje(
        "Error cargando información.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const empleadosLibres = empleados.filter(
    (emp) =>
      !usuarios.some(
        (u) => u.id_empleado === emp.id_empleado
      )
  );

  const getNombreEmpleado = (id: number | null) => {
    if (!id) return null;

    const emp = empleados.find(
      (e) => e.id_empleado === id
    );

    return emp
      ? `${emp.nombre_empleado} ${emp.apellido_empleado}`
      : null;
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda.trim()) return true;

    const q = busqueda.toLowerCase();

    return (
      u.nombre.toLowerCase().includes(q) ||
      u.rol.toLowerCase().includes(q)
    );
  });

  const handleCrearUsuario = async () => {
    if (!userForm.nombre.trim()) {
      setErrorUser("El nombre es obligatorio");
      return;
    }

    if (!userForm.password.trim()) {
      setErrorUser("La contraseña es obligatoria");
      return;
    }

    setGuardandoUser(true);
    setErrorUser("");

    try {
      const res = await fetchWithFallback(
        "/auth/register",
        {
          method: "POST",
          headers,
          body: JSON.stringify(userForm),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(parseError(data));
      }

      setMostrarModalUser(false);
      setUserForm(emptyUserForm);

      mostrarMensaje(
        "Usuario creado correctamente.",
        "success"
      );

      await cargarUsuarios();
    } catch (e: any) {
      setErrorUser(
        e.message || "No se pudo crear el usuario."
      );

      mostrarMensaje(
        e.message || "No se pudo crear el usuario.",
        "error"
      );
    } finally {
      setGuardandoUser(false);
    }
  };

  const handleVincular = async () => {
    if (!modalVincular || !empSeleccionado) return;

    setGuardandoVinculo(true);

    try {
      const idEmpleado = Number(empSeleccionado);

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === modalVincular.id_usuario
            ? {
                ...u,
                id_empleado: idEmpleado,
              }
            : u
        )
      );

      setModalVincular(null);
      setEmpSeleccionado("");

      alert("Empleado vinculado correctamente");

      cargarUsuarios();

    } catch (e: any) {
      alert(e.message || "No se pudo vincular.");
    } finally {
      setGuardandoVinculo(false);
    }
  };

  const handleDesvincular = async (
    usuario: Usuario
  ) => {
    try {
      const res = await fetchWithFallback(
        `/api/usuarios/${usuario.id_usuario}/empleado`,
        {
          method: "DELETE",
          headers,
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(parseError(data));
      }

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id_usuario === usuario.id_usuario
            ? {
                ...u,
                id_empleado: null,
              }
            : u
        )
      );

      setConfirmDesvincular(null);

      mostrarMensaje(
        "Empleado desvinculado correctamente.",
        "success"
      );
    } catch (e: any) {
      mostrarMensaje(
        e.message || "No se pudo desvincular.",
        "error"
      );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {mensaje && (
        <div className="fixed top-5 right-5 z-9999">
          <div
            className={`px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
              tipoMensaje === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {mensaje}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">
            Cargando...
          </p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Gestión de Personal
              </h1>
            </div>

            <button
              onClick={() => {
                setUserForm(emptyUserForm);
                setErrorUser("");
                setMostrarPassword(false);
                setMostrarModalUser(true);
              }}
              className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              Nuevo Usuario
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre o rol..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm"
            />

            <span className="text-sm text-gray-400">
              {usuariosFiltrados.length} usuario
              {usuariosFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Nombre</th>
                  <th className="p-4 text-left">Rol</th>
                  <th className="p-4 text-left">
                    Empleado Vinculado
                  </th>
                  <th className="p-4 text-center">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {usuariosFiltrados.map((u) => {
                  const empNombre =
                    getNombreEmpleado(u.id_empleado);

                  return (
                    <tr
                      key={u.id_usuario}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4 text-sm">
                        #{u.id_usuario}
                      </td>

                      <td className="p-4 font-medium text-sm">
                        {u.nombre}
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${rolBadge(
                            u.rol
                          )}`}
                        >
                          {u.rol}
                        </span>
                      </td>

                      <td className="p-4">
                        {empNombre ? (
                          <span className="text-sm font-medium">
                            {empNombre}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Sin vincular
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          {u.id_empleado ? (
                            <button
                              onClick={() =>
                                setConfirmDesvincular(u)
                              }
                              className="text-xs text-red-600 font-medium px-3 py-1.5 rounded-md hover:bg-red-50"
                            >
                              Desvincular
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setModalVincular(u);
                                setEmpSeleccionado("");
                              }}
                              className="text-xs text-blue-600 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50"
                            >
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
          </div>
        </main>
      )}

      {mostrarModalUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-5">
              Nuevo Usuario
            </h3>

            {errorUser && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">
                {errorUser}
              </div>
            )}

            <div className="flex flex-col gap-4 mb-4">
              <input
                type="text"
                placeholder="Nombre"
                value={userForm.nombre}
                onChange={(e) =>
                  setUserForm((p) => ({
                    ...p,
                    nombre: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md w-full p-2 text-sm"
              />

              <input
                type={
                  mostrarPassword ? "text" : "password"
                }
                placeholder="Contraseña"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm((p) => ({
                    ...p,
                    password: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md w-full p-2 text-sm"
              />

              <select
                value={userForm.rol}
                onChange={(e) =>
                  setUserForm((p) => ({
                    ...p,
                    rol: e.target.value,
                  }))
                }
                className="border border-gray-300 rounded-md w-full p-2 text-sm"
              >
                <option value="user">user</option>
                <option value="UserRH">UserRH</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCrearUsuario}
                disabled={guardandoUser}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md"
              >
                {guardandoUser
                  ? "Creando..."
                  : "Crear Usuario"}
              </button>

              <button
                onClick={() =>
                  setMostrarModalUser(false)
                }
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalVincular && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Vincular Empleado
            </h3>

            <select
              value={empSeleccionado}
              onChange={(e) =>
                setEmpSeleccionado(Number(e.target.value))
              }
              className="border border-gray-300 rounded-md w-full p-2 text-sm mb-4"
            >
              <option value="">
                Seleccionar empleado
              </option>

              {empleadosLibres.map((emp) => (
                <option
                  key={emp.id_empleado}
                  value={emp.id_empleado}
                >
                  {emp.nombre_empleado}{" "}
                  {emp.apellido_empleado}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                onClick={handleVincular}
                disabled={
                  guardandoVinculo || !empSeleccionado
                }
                className="flex-1 bg-blue-600 text-white py-2 rounded-md"
              >
                {guardandoVinculo
                  ? "Vinculando..."
                  : "Vincular"}
              </button>

              <button
                onClick={() => {
                  setModalVincular(null);
                  setEmpSeleccionado("");
                }}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDesvincular && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-3">
              ¿Desvincular empleado?
            </h3>

            <p className="text-sm text-gray-500 mb-5">
              ¿Seguro que deseas desvincular el usuario{" "}
              <span className="font-medium text-gray-700">
                {confirmDesvincular.nombre}
              </span>
              ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleDesvincular(
                    confirmDesvincular
                  )
                }
                className="flex-1 bg-red-600 text-white py-2 rounded-md"
              >
                Desvincular
              </button>

              <button
                onClick={() =>
                  setConfirmDesvincular(null)
                }
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md"
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