import { useState } from 'react';

type Empleado = {
  id: number;
  nombres: string;
  apellidos: string;
  estado: string;
};

type ReporteNomina = {
  empleadoId: number;
  nombres: string;
  apellidos: string;
  salarioBase: number;
  horasExtra: number;
  bonificaciones: number;
  deducciones: number;
  totalPagar: number;
  periodo: string;
  tipoPeriodo: string;
  estadoNomina: string;
};

type ReporteExpediente = {
  empleadoId: number;
  nombres: string;
  apellidos: string;
  estado: string;
  totalDocumentos: number;
  documentosFaltantes: string[];
};

type ReporteAcademico = {
  empleadoId: number;
  nombres: string;
  apellidos: string;
  totalRegistrosAcademicos: number;
};

type ReporteContratacion = {
  empleadoId: number;
  nombres: string;
  apellidos: string;
  dpi: string;
  estadoLaboral: string;
  tieneDpi: boolean;
  tieneContrato: boolean;
  tieneRegistrosAcademicos: boolean;
  cumpleContratacion: string;
};

const empleadosMock: Empleado[] = [
  { id: 1, nombres: 'Marvin', apellidos: 'Zepeda', estado: 'activo' },
  { id: 2, nombres: 'José', apellidos: 'González', estado: 'activo' },
  { id: 3, nombres: 'Jasmine', apellidos: 'Ruano', estado: 'retirado' },
];

const nominaMock: ReporteNomina[] = [
  {
    empleadoId: 1,
    nombres: 'Marvin',
    apellidos: 'Zepeda',
    salarioBase: 4500,
    horasExtra: 300,
    bonificaciones: 250,
    deducciones: 150,
    totalPagar: 4900,
    periodo: 'Mayo 2026',
    tipoPeriodo: 'Mensual',
    estadoNomina: 'Pagada',
  },
  {
    empleadoId: 2,
    nombres: 'José',
    apellidos: 'González',
    salarioBase: 5200,
    horasExtra: 200,
    bonificaciones: 400,
    deducciones: 250,
    totalPagar: 5750,
    periodo: 'Mayo 2026',
    tipoPeriodo: 'Mensual',
    estadoNomina: 'Pendiente',
  },
];

const expedientesMock: ReporteExpediente[] = [
  {
    empleadoId: 1,
    nombres: 'Marvin',
    apellidos: 'Zepeda',
    estado: 'activo',
    totalDocumentos: 5,
    documentosFaltantes: [],
  },
  {
    empleadoId: 2,
    nombres: 'José',
    apellidos: 'González',
    estado: 'activo',
    totalDocumentos: 3,
    documentosFaltantes: ['Contrato', 'DPI'],
  },
];

const academicoMock: ReporteAcademico[] = [
  {
    empleadoId: 1,
    nombres: 'Marvin',
    apellidos: 'Zepeda',
    totalRegistrosAcademicos: 2,
  },
  {
    empleadoId: 2,
    nombres: 'José',
    apellidos: 'González',
    totalRegistrosAcademicos: 1,
  },
];

const contratacionMock: ReporteContratacion[] = [
  {
    empleadoId: 1,
    nombres: 'Marvin',
    apellidos: 'Zepeda',
    dpi: '1234567890101',
    estadoLaboral: 'activo',
    tieneDpi: true,
    tieneContrato: true,
    tieneRegistrosAcademicos: true,
    cumpleContratacion: 'Cumple',
  },
  {
    empleadoId: 2,
    nombres: 'José',
    apellidos: 'González',
    dpi: '9876543210101',
    estadoLaboral: 'activo',
    tieneDpi: true,
    tieneContrato: false,
    tieneRegistrosAcademicos: true,
    cumpleContratacion: 'Pendiente',
  },
];

export default function Reportes() {
  const [empleados] = useState<Empleado[]>(empleadosMock);
  const [nomina, setNomina] = useState<ReporteNomina[]>(nominaMock);
  const [expedientes] = useState<ReporteExpediente[]>(expedientesMock);
  const [academico] = useState<ReporteAcademico[]>(academicoMock);
  const [contratacion] = useState<ReporteContratacion[]>(contratacionMock);
  const [periodo, setPeriodo] = useState('');

  const filtrarNomina = () => {
    if (!periodo.trim()) {
      setNomina(nominaMock);
      return;
    }

    const filtrada = nominaMock.filter((item) =>
      item.periodo.toLowerCase().includes(periodo.toLowerCase()),
    );

    setNomina(filtrada);
  };

  const limpiarFiltro = () => {
    setPeriodo('');
    setNomina(nominaMock);
  };

  const totalEmpleados = empleados.length;
  const activos = empleados.filter((e) => e.estado === 'activo').length;
  const retirados = empleados.filter((e) => e.estado === 'retirado').length;

  const totalNomina = nomina.reduce(
    (acc, item) => acc + Number(item.totalPagar || 0),
    0,
  );

  const expedientesCompletos = expedientes.filter(
    (e) => e.totalDocumentos >= 5,
  ).length;

  const cumplenContratacion = contratacion.filter(
    (c) => c.cumpleContratacion === 'Cumple',
  ).length;

  return (
    <div className="min-h-screen space-y-8 bg-slate-950 p-6 text-white">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-slate-400">
            Resumen general de empleados, nómina, expedientes y contratación
          </p>
        </div>

        <button
          onClick={limpiarFiltro}
          className="rounded-xl border border-cyan-500/30 bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700"
        >
          Actualizar vista
        </button>
      </div>

      <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        <Card title="Empleados" value={totalEmpleados} icon="👥" />
        <Card title="Activos" value={activos} icon="✅" />
        <Card title="Retirados" value={retirados} icon="🚪" />
        <Card
          title="Total Nómina"
          value={`Q${totalNomina.toLocaleString()}`}
          icon="💰"
        />
        <Card title="Exp. completos" value={expedientesCompletos} icon="📁" />
        <Card title="Cumplen" value={cumplenContratacion} icon="📋" />
      </section>

      <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Filtro de nómina</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <input
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            placeholder="Ejemplo: Mayo 2026"
            className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
          />

          <button
            onClick={filtrarNomina}
            className="rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white hover:bg-cyan-700"
          >
            Filtrar
          </button>

          <button
            onClick={limpiarFiltro}
            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Limpiar
          </button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <Panel title="Reporte de nómina">
          {nomina.length === 0 ? (
            <Empty text="No hay datos de nómina." />
          ) : (
            <div className="space-y-3">
              {nomina.map((item) => (
                <div
                  key={item.empleadoId}
                  className="rounded-xl bg-slate-950 p-4"
                >
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold">
                        {item.nombres} {item.apellidos}
                      </p>
                      <p className="text-sm text-slate-400">
                        {item.periodo} · {item.tipoPeriodo}
                      </p>
                    </div>

                    <p className="font-bold text-green-400">
                      Q{Number(item.totalPagar).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Reporte de expedientes">
          <div className="space-y-3">
            {expedientes.map((item) => (
              <div
                key={item.empleadoId}
                className="rounded-xl bg-slate-950 p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {item.nombres} {item.apellidos}
                    </p>
                    <p className="text-sm text-slate-400">
                      Documentos: {item.totalDocumentos}
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      item.totalDocumentos >= 5
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {item.totalDocumentos >= 5 ? 'Completo' : 'Incompleto'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Reporte académico">
          <div className="space-y-3">
            {academico.map((item) => (
              <div
                key={item.empleadoId}
                className="flex justify-between rounded-xl bg-slate-950 p-4"
              >
                <span>
                  {item.nombres} {item.apellidos}
                </span>
                <span className="text-cyan-400">
                  {item.totalRegistrosAcademicos} registros
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Reporte de contratación">
          <div className="space-y-3">
            {contratacion.map((item) => (
              <div
                key={item.empleadoId}
                className="rounded-xl bg-slate-950 p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {item.nombres} {item.apellidos}
                    </p>
                    <p className="text-sm text-slate-400">DPI: {item.dpi}</p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      item.cumpleContratacion === 'Cumple'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-amber-500/10 text-amber-400'
                    }`}
                  >
                    {item.cumpleContratacion}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Card({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-5 shadow-lg shadow-cyan-500/5">
      <div className="mb-3 text-3xl">{icon}</div>
      <div className="text-2xl font-bold text-cyan-400">{value}</div>
      <p className="text-sm text-slate-500">{title}</p>
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
    <section className="rounded-2xl border border-cyan-500/20 bg-slate-900 p-6 shadow-lg shadow-cyan-500/5">
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-slate-500">{text}</p>;
}