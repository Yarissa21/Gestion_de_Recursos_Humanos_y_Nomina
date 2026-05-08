import { useState } from 'react';

type Rol = 'admin' | 'rrhh' | 'empleado';

type EmpleadoBackend = {
  id: number;
  nombres: string;
  apellidos: string;
  dpi: string;
  email: string | null;
  cargo: string | null;
  departamento: string | null;
  usuario_id?: number | null;
};

const roles: { value: Rol; label: string; color: string }[] = [
  {
    value: 'empleado',
    label: 'Empleado',
    color:
      'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  {
    value: 'rrhh',
    label: 'RRHH',
    color:
      'border-blue-500/30 bg-blue-500/10 text-blue-300',
  },
  {
    value: 'admin',
    label: 'Admin',
    color:
      'border-violet-500/30 bg-violet-500/10 text-violet-300',
  },
];

const empleadosMock: EmpleadoBackend[] = [
  {
    id: 1,
    nombres: 'Nayeli',
    apellidos: 'Zepeda',
    dpi: '1234567890101',
    email: 'nayeli@empresa.com',
    cargo: 'Desarrollador',
    departamento: 'TI',
    usuario_id: 1,
  },
  {
    id: 2,
    nombres: 'José',
    apellidos: 'González',
    dpi: '9876543210101',
    email: null,
    cargo: 'Analista',
    departamento: 'RRHH',
    usuario_id: null,
  },
  {
    id: 3,
    nombres: 'Cristina',
    apellidos: 'Maldonado',
    dpi: '4567891230101',
    email: 'cristina@empresa.com',
    cargo: 'Diseñadora',
    departamento: 'Marketing',
    usuario_id: null,
  },
];

export default function AdminHome() {
  const [empleados, setEmpleados] =
    useState<EmpleadoBackend[]>(empleadosMock);

  const [empleadoSeleccionado, setEmpleadoSeleccionado] =
    useState<EmpleadoBackend | null>(null);

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<Rol>('empleado');
  const [busqueda, setBusqueda] = useState('');

  const cerrarSesion = () => {
    alert('Sesión cerrada');
  };

  const abrirCrearAcceso = (
    empleado: EmpleadoBackend,
  ) => {
    setEmpleadoSeleccionado(empleado);
    setCorreo(empleado.email || '');
    setContrasena('');
    setRol('empleado');
  };

  const cerrarPanel = () => {
    setEmpleadoSeleccionado(null);
    setCorreo('');
    setContrasena('');
    setRol('empleado');
  };

  const crearAcceso = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!empleadoSeleccionado) return;

    if (!correo.trim()) {
      alert('Ingresa un correo');
      return;
    }

    if (contrasena.length < 6) {
      alert('La contraseña debe tener mínimo 6 caracteres');
      return;
    }

    const nuevos = empleados.map((emp) => {
      if (emp.id === empleadoSeleccionado.id) {
        return {
          ...emp,
          email: correo,
          usuario_id: 1,
        };
      }

      return emp;
    });

    setEmpleados(nuevos);

    alert('Acceso creado correctamente');

    cerrarPanel();
  };

  const empleadosFiltrados = empleados.filter((emp) => {
    const texto = `${emp.nombres} ${emp.apellidos} ${emp.dpi} ${
      emp.email || ''
    }`.toLowerCase();

    return texto.includes(busqueda.toLowerCase());
  });

  return (
    <div className="min-h-screen space-y-8 bg-slate-950 p-6 text-white">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-8 shadow-2xl">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
              Panel Administrador
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight">
              Gestión de Accesos
            </h1>

            <p className="mt-3 max-w-2xl text-slate-400">
              Administración visual de usuarios y accesos
              del sistema.
            </p>
          </div>

          <button
            type="button"
            onClick={cerrarSesion}
            className="rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-3 font-bold text-red-300 transition hover:bg-red-500/20"
          >
            Cerrar sesión
          </button>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="overflow-hidden rounded-3xl border border-cyan-500/10 bg-slate-900/80 shadow-2xl">
          <div className="flex flex-col gap-4 border-b border-cyan-500/10 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Empleados registrados
              </h2>

              <p className="text-sm text-slate-500">
                {empleadosFiltrados.length} empleados
                encontrados
              </p>
            </div>

            <input
              type="text"
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar empleado..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 text-white outline-none transition focus:border-cyan-500 md:w-80"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cyan-500/5">
                  {[
                    'Empleado',
                    'DPI',
                    'Cargo',
                    'Departamento',
                    'Correo',
                    'Acceso',
                    'Acción',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {empleadosFiltrados.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-t border-cyan-500/5 transition hover:bg-cyan-500/5"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {emp.nombres} {emp.apellidos}
                      </p>

                      <p className="text-xs text-slate-500">
                        ID #{emp.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {emp.dpi}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {emp.cargo || 'Sin cargo'}
                    </td>

                    <td className="px-5 py-4 text-slate-400">
                      {emp.departamento ||
                        'Sin departamento'}
                    </td>

                    <td className="px-5 py-4">
                      {emp.email ? (
                        <span className="text-cyan-300">
                          {emp.email}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
                          Sin correo
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {emp.usuario_id ? (
                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
                          Creado
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        disabled={!!emp.usuario_id}
                        onClick={() =>
                          abrirCrearAcceso(emp)
                        }
                        className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-700"
                      >
                        {emp.usuario_id
                          ? 'Acceso creado'
                          : 'Crear acceso'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="rounded-3xl border border-cyan-500/10 bg-slate-900/80 p-6 shadow-2xl">
          {!empleadoSeleccionado ? (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 p-6 text-4xl">
                👤
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Selecciona un empleado
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Elige un empleado para crearle acceso.
              </p>
            </div>
          ) : (
            <form
              onSubmit={crearAcceso}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold">
                  Crear acceso
                </h2>

                <p className="text-sm text-slate-500">
                  Usuario del sistema
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-500/10 bg-cyan-500/5 p-5">
                <p className="text-sm text-slate-400">
                  Empleado seleccionado
                </p>

                <p className="mt-1 text-lg font-bold">
                  {empleadoSeleccionado.nombres}{' '}
                  {empleadoSeleccionado.apellidos}
                </p>

                <p className="text-sm text-slate-500">
                  DPI: {empleadoSeleccionado.dpi}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Correo
                </label>

                <input
                  type="email"
                  value={correo}
                  onChange={(e) =>
                    setCorreo(e.target.value)
                  }
                  placeholder="correo@empresa.com"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Contraseña
                </label>

                <input
                  type="password"
                  value={contrasena}
                  onChange={(e) =>
                    setContrasena(e.target.value)
                  }
                  placeholder="******"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 text-white outline-none transition focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-300">
                  Rol
                </label>

                <div className="grid gap-3">
                  {roles.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setRol(item.value)
                      }
                      className={`rounded-2xl border p-4 text-left transition ${
                        rol === item.value
                          ? item.color
                          : 'border-slate-700 bg-slate-950 text-slate-400'
                      }`}
                    >
                      <p className="font-bold">
                        {item.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-cyan-600 px-5 py-4 font-bold text-white transition hover:bg-cyan-700"
                >
                  Crear acceso
                </button>

                <button
                  type="button"
                  onClick={cerrarPanel}
                  className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-4 font-bold text-slate-300 transition hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}