import { useState } from 'react';

type Empleado = {
  id: number;
  nombres: string;
  apellidos: string;
  dpi: string;
  fecha_nacimiento: string | null;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  salario: number | string;
  cargo: string | null;
  departamento: string | null;
  estado: string;
};

type Academico = {
  id: number;
  titulo: string;
  institucion: string;
  fecha_graduacion: string | null;
};

type Documento = {
  id: number;
  nombre_archivo: string;
  tipo_documento: string;
  fecha_carga: string | null;
};

type Nomina = {
  id: number;
  salario_base: number;
  horas_trabajadas: number;
  horas_extra: number;
  bonificaciones: number;
  deducciones: number;
  salario_final: number;
};

export default function EmpleadoHome() {
  const [empleado] = useState<Empleado>({
    id: 1,
    nombres: 'Yeniffer Nayeli',
    apellidos: 'Zepeda Ramirez',
    dpi: '1234567890101',
    fecha_nacimiento: '28-02-2005',
    direccion: 'San Juan Tecuaco, Santa Rosa',
    telefono: '5555-5555',
    email: 'yeniffer@empresa.com',
    salario: 5000,
    cargo: 'Desarrollador Junior',
    departamento: 'Tecnología',
    estado: 'Activo',
  });

  const [academico] = useState<Academico[]>([
    {
      id: 1,
      titulo: 'Ingeniería en Sistemas',
      institucion: 'Universidad Mariano Gálvez',
      fecha_graduacion: null,
    },
    {
      id: 2,
      titulo: 'Bachiller en Computación',
      institucion: 'Colegio Nacional',
      fecha_graduacion: '2021-10-30',
    },
  ]);

  const [documentos] = useState<Documento[]>([
    {
      id: 1,
      nombre_archivo: 'DPI.pdf',
      tipo_documento: 'Identificación',
      fecha_carga: '2026-05-01',
    },
    {
      id: 2,
      nombre_archivo: 'Contrato.pdf',
      tipo_documento: 'Contrato laboral',
      fecha_carga: '2026-05-03',
    },
    {
      id: 3,
      nombre_archivo: 'Curriculum.pdf',
      tipo_documento: 'CV',
      fecha_carga: '2026-05-05',
    },
  ]);

  const [nominas] = useState<Nomina[]>([
    {
      id: 1,
      salario_base: 4500,
      horas_trabajadas: 160,
      horas_extra: 12,
      bonificaciones: 350,
      deducciones: 180,
      salario_final: 5070,
    },
    {
      id: 2,
      salario_base: 4500,
      horas_trabajadas: 160,
      horas_extra: 6,
      bonificaciones: 200,
      deducciones: 150,
      salario_final: 4750,
    },
  ]);

  const nombreCompleto = `${empleado.nombres} ${empleado.apellidos}`;

  const cerrarSesion = () => {
    alert('Sesión cerrada');
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                Portal del Empleado
              </span>

              <h1 className="mt-5 text-4xl font-black text-slate-950">
                Bienvenido, {empleado.nombres}
              </h1>

              <p className="mt-2 text-slate-500">
                Aquí puedes consultar tu información personal, laboral,
                académica, expediente y nómina.
              </p>
            </div>

            <button
              onClick={cerrarSesion}
              className="rounded-2xl bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100"
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Empleado" value={nombreCompleto} detail={`DPI: ${empleado.dpi}`} />
          <Card title="Cargo" value={empleado.cargo || 'Sin cargo'} detail={empleado.departamento || 'Sin departamento'} />
          <Card title="Estado" value={empleado.estado} detail="Situación laboral actual" />
          <Card title="Salario" value={`Q${Number(empleado.salario).toLocaleString()}`} detail="Salario registrado" />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Panel title="Datos personales">
            <Info label="Nombre completo" value={nombreCompleto} />
            <Info label="Fecha de nacimiento" value={empleado.fecha_nacimiento || 'Sin fecha'} />
            <Info label="Teléfono" value={empleado.telefono || 'Sin teléfono'} />
            <Info label="Correo" value={empleado.email || 'Sin correo'} />
            <Info label="Dirección" value={empleado.direccion || 'Sin dirección'} />
          </Panel>

          <Panel title="Información laboral">
            <Info label="Cargo" value={empleado.cargo || 'Sin cargo'} />
            <Info label="Departamento" value={empleado.departamento || 'Sin departamento'} />
            <Info label="Estado" value={empleado.estado} />
            <Info label="Salario" value={`Q${Number(empleado.salario).toLocaleString()}`} />
          </Panel>
        </section>

        <Panel title="Formación académica">
          <div className="grid gap-4 md:grid-cols-2">
            {academico.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-lg font-bold text-slate-900">
                  {item.titulo}
                </p>

                <p className="text-slate-500">{item.institucion}</p>

                <p className="mt-3 text-sm text-blue-600">
                  Graduación:{' '}
                  {item.fecha_graduacion || 'En curso / sin fecha'}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Expediente">
          <div className="space-y-3">
            {documentos.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {doc.nombre_archivo}
                  </p>

                  <p className="text-sm text-slate-500">
                    {doc.tipo_documento}
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                  {doc.fecha_carga || 'Sin fecha'}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Nómina">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-400">
                  <th className="p-3">Salario base</th>
                  <th className="p-3">Horas</th>
                  <th className="p-3">Extras</th>
                  <th className="p-3">Bonos</th>
                  <th className="p-3">Deducciones</th>
                  <th className="p-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {nominas.map((n) => (
                  <tr
                    key={n.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="p-3">
                      Q{n.salario_base.toLocaleString()}
                    </td>

                    <td className="p-3">{n.horas_trabajadas}</td>

                    <td className="p-3">{n.horas_extra}</td>

                    <td className="p-3 text-green-600">
                      Q{n.bonificaciones.toLocaleString()}
                    </td>

                    <td className="p-3 text-red-500">
                      Q{n.deducciones.toLocaleString()}
                    </td>

                    <td className="p-3 font-black text-blue-700">
                      Q{n.salario_final.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200">
      <p className="text-sm font-bold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-xl font-black text-slate-950">
        {value}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-lg shadow-slate-200">
      <h2 className="mb-5 border-b border-slate-100 pb-4 text-2xl font-black text-slate-950">
        {title}
      </h2>

      {children}
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}