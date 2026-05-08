import { useState } from 'react';

type Empleado = {
  id: number;
  nombres: string;
  apellidos: string;
  dpi: string;
};

type RegistroAcademico = {
  id: number;
  empleado_id: number;
  titulo: string;
  institucion: string;
  fecha_graduacion: string | null;
  empleados?: Empleado;
};

type FormAcademico = {
  empleado_id: string;
  titulo: string;
  institucion: string;
  fecha_graduacion: string;
};

const empleadosMock: Empleado[] = [
  {
    id: 1,
    nombres: 'Marvin',
    apellidos: 'Zepeda',
    dpi: '1234567890101',
  },
  {
    id: 2,
    nombres: 'José',
    apellidos: 'González',
    dpi: '9876543210101',
  },
];

const registrosMock: RegistroAcademico[] = [
  {
    id: 1,
    empleado_id: 1,
    titulo: 'Ingeniería en Sistemas',
    institucion: 'Universidad Mariano Gálvez',
    fecha_graduacion: '2026-05-01',
    empleados: empleadosMock[0],
  },
  {
    id: 2,
    empleado_id: 2,
    titulo: 'Técnico en Redes',
    institucion: 'Intecap',
    fecha_graduacion: '2024-11-10',
    empleados: empleadosMock[1],
  },
];

const formInicial: FormAcademico = {
  empleado_id: '',
  titulo: '',
  institucion: '',
  fecha_graduacion: '',
};

export default function Academico() {
  const [empleados] = useState<Empleado[]>(empleadosMock);

  const [registros, setRegistros] =
    useState<RegistroAcademico[]>(registrosMock);

  const [form, setForm] = useState<FormAcademico>(formInicial);

  const guardarAcademico = (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (
      !form.empleado_id ||
      !form.titulo ||
      !form.institucion
    ) {
      alert('Completa todos los campos');
      return;
    }

    const empleadoSeleccionado = empleados.find(
      (e) => e.id === Number(form.empleado_id),
    );

    const nuevoRegistro: RegistroAcademico = {
      id: registros.length + 1,
      empleado_id: Number(form.empleado_id),
      titulo: form.titulo,
      institucion: form.institucion,
      fecha_graduacion: form.fecha_graduacion || null,
      empleados: empleadoSeleccionado,
    };

    setRegistros([...registros, nuevoRegistro]);

    setForm(formInicial);

    alert('Registro académico agregado');
  };

  const eliminarRegistro = (id: number) => {
    const nuevos = registros.filter(
      (item) => item.id !== id,
    );

    setRegistros(nuevos);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Información Académica
        </h1>

        <p className="text-slate-400">
          Gestión académica de empleados
        </p>
      </div>

      <form
        onSubmit={guardarAcademico}
        className="grid gap-4 rounded-2xl border border-cyan-500/10 bg-slate-950/80 p-6 shadow-2xl shadow-cyan-500/5 md:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Empleado
          </label>

          <select
            value={form.empleado_id}
            onChange={(e) =>
              setForm({
                ...form,
                empleado_id: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
          >
            <option value="">
              Seleccione un empleado
            </option>

            {empleados.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nombres} {emp.apellidos}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Título
          </label>

          <input
            type="text"
            value={form.titulo}
            onChange={(e) =>
              setForm({
                ...form,
                titulo: e.target.value,
              })
            }
            placeholder="Ingeniería en Sistemas"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Institución
          </label>

          <input
            type="text"
            value={form.institucion}
            onChange={(e) =>
              setForm({
                ...form,
                institucion: e.target.value,
              })
            }
            placeholder="Universidad Mariano Gálvez"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Fecha de graduación
          </label>

          <input
            type="date"
            value={form.fecha_graduacion}
            onChange={(e) =>
              setForm({
                ...form,
                fecha_graduacion: e.target.value,
              })
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
          />
        </div>

        <div className="flex gap-3 md:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-cyan-600 px-6 py-3 font-semibold text-white transition hover:bg-cyan-700"
          >
            Guardar
          </button>

          <button
            type="button"
            onClick={() => setForm(formInicial)}
            className="rounded-xl bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600"
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-cyan-500/10 bg-slate-950/80 shadow-2xl shadow-cyan-500/5">
        <div className="flex items-center justify-between border-b border-cyan-500/10 px-6 py-5">
          <h2 className="text-xl font-semibold text-white">
            Registros académicos
          </h2>

          <span className="text-sm text-slate-400">
            {registros.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cyan-500/5">
                {[
                  'Empleado',
                  'Título',
                  'Institución',
                  'Graduación',
                  'Acciones',
                ].map((item) => (
                  <th
                    key={item}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {registros.map((item) => (
                <tr
                  key={item.id}
                  className="border-t border-slate-800 hover:bg-cyan-500/5"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">
                      {item.empleados?.nombres}{' '}
                      {item.empleados?.apellidos}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.empleados?.dpi}
                    </p>
                  </td>

                  <td className="px-4 py-4 text-cyan-400">
                    {item.titulo}
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {item.institucion}
                  </td>

                  <td className="px-4 py-4 text-slate-400">
                    {item.fecha_graduacion ||
                      'Sin fecha'}
                  </td>

                  <td className="px-4 py-4">
                    <button
                      onClick={() =>
                        eliminarRegistro(item.id)
                      }
                      className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}

              {registros.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No hay registros académicos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}