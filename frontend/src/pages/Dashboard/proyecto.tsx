import Header from "../../components/Header";

interface Integrante {
  nombre: string;
  carnet: string;
  backend?: string[];
  frontend?: string[];
  despliegue?: string[];
  documentacion?: string[];
}

const integrantes: Integrante[] = [
  {
    nombre: "Yarissa Alexandra Hernández Mijangos",
    carnet: "1790-23-1812",
    backend: [
      "Implementación de base de datos con Prisma",
      "Módulo departamento",
      "Módulo puesto de trabajo",
      "Módulo de nómina",
      "Módulo de concepto nómina",
      "Módulo de empleados",
      "Arreglo de problemas de backend",
      "Implementación de Swagger",

    ],
    frontend: [
      "Arreglo de problemas de frontend"
    ],
    despliegue: ["Base de datos en Neon", "Frontend en Netlify"],
    documentacion: ["Manual técnico"],
  },
  {
    nombre: "Anthony Obed Ortiz Ochoa",
    carnet: "1790-23-3899",
    backend: [
      "Módulo de académicos",
      "Módulo de tipo documento académico",
      "Módulo de reportes",
      "Implementación de validaciones faltantes",
      "Arreglo de problemas de backend",
    ],
    frontend: [
      "Llamada de todos los módulos y diseño de la página",
      "Implementación de mensajes de alerta y validaciones faltantes",
      "Arreglo de problemas de frontend",
    ],
    despliegue: ["Backend en Render"],
    documentacion: ["Manual de usuario", "Minutas semana 4 hasta finalizar"],
  },
  {
    nombre: "María Cristina Maldonado León",
    carnet: "1790-23-24987",
    backend: [
      "Módulo de auth (registro y login de usuarios)",
      "Módulo de usuarios",
      "Agregar permisos en otros módulos",
    ],
    frontend: [
      "Realización del login y permisos",
      "Plantilla principal de la página",
      "Unificación de backend y frontend",
    ],
    documentacion: ["Redacción de informe y dercas"],
  },
  {
    nombre: "Pedro Jose Barillas Melgar",
    carnet: "1790-22-17364",
    backend: ["Módulo de expediente", "Módulo validación expediente"],
    documentacion: ["Apoyo en redacción de informe", "Dercas"],
  },
  {
    nombre: "Yeniffer Nayeli Zepeda Ramírez",
    carnet: "1790-23-8589",
    documentacion: [
      "Redacción de minutas hasta la semana 3",
      "Apoyo en redacción de informe",
    ],
  },
];

const stackFrontend = [
  "React 19",
  "TypeScript",
  "Vite",
  "Tailwind CSS 4",
  "React Router DOM 7",
];

const stackBackend = [
  "NestJS 11",
  "TypeScript",
  "Passport JWT",
  "bcrypt",
  "Multer",
  "pdfmake",
  "class-validator / class-transformer",
  "Swagger",
];

const stackDB = [
  "PostgreSQL",
  "Prisma ORM",
  "Neon (base de datos)",
  "Render (backend)",
  "Netlify (frontend)",
];

const AporteSeccion = ({
  label,
  items,
  color,
  icono,
}: {
  label: string;
  items: string[];
  color: string;
  icono: string;
}) => (
  <div className="mb-3">
    <p className={`text-xs font-medium uppercase tracking-wide mb-1.5 flex items-center gap-1.5 ${color}`}>
      <span>{icono}</span>
      {label}
    </p>
    <div className="flex flex-col gap-1">
      {items.map((item, i) => (
        <p
          key={i}
          className="text-xs text-gray-600 bg-gray-50 rounded-md px-2.5 py-1.5 leading-snug"
          style={{
            borderLeft: `2px solid ${
              label === "Backend"
                ? "#185FA5"
                : label === "Frontend"
                ? "#0F6E56"
                : label === "Despliegue"
                ? "#BA7517"
                : "#993556"
            }`,
          }}
        >
          {item}
        </p>
      ))}
    </div>
  </div>
);

export default function Proyecto() {
  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      <main className="max-w-6xl mx-auto px-6 mt-10 pb-16">

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Aportes del equipo de desarrollo</h1>
            <p className="text-sm text-gray-500 mt-0.5">Grupo No. 2 — Sistema de Gestión de RRHH y Nómina</p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { color: "#185FA5", bg: "#E6F1FB", label: "Backend" },
            { color: "#0F6E56", bg: "#E1F5EE", label: "Frontend" },
            { color: "#BA7517", bg: "#FAEEDA", label: "Despliegue" },
            { color: "#993556", bg: "#FBEAF0", label: "Documentación" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Integrantes */}
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
          Integrantes y aportes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
          {integrantes.map((int) => (
            <div key={int.carnet} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">

              {/* Card header */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                {/* Espacio foto */}
                <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center shrink-0 gap-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-gray-300 text-[9px]">foto</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{int.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{int.carnet}</p>
                </div>
              </div>

              {/* Aportes */}
              {int.backend && (
                <AporteSeccion label="Backend" items={int.backend} color="text-blue-600" icono="⚙️" />
              )}
              {int.frontend && (
                <AporteSeccion label="Frontend" items={int.frontend} color="text-emerald-700" icono="🖥️" />
              )}
              {int.despliegue && (
                <AporteSeccion label="Despliegue" items={int.despliegue} color="text-amber-700" icono="🚀" />
              )}
              {int.documentacion && (
                <AporteSeccion label="Documentación" items={int.documentacion} color="text-pink-700" icono="📄" />
              )}
            </div>
          ))}
        </div>

        {/* Stack tecnológico */}
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
          Stack tecnológico utilizado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Frontend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" /><path d="M9 21V9" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800">Frontend</p>
            </div>
            <div className="flex flex-col gap-2">
              {stackFrontend.map((t) => (
                <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 w-fit">{t}</span>
              ))}
            </div>
          </div>

          {/* Backend */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" /><path d="M12 17v4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800">Backend</p>
            </div>
            <div className="flex flex-col gap-2">
              {stackBackend.map((t) => (
                <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 w-fit">{t}</span>
              ))}
            </div>
          </div>

          {/* DB y despliegue */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-800">Base de datos y despliegue</p>
            </div>
            <div className="flex flex-col gap-2">
              {stackDB.map((t) => (
                <span key={t} className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 w-fit">{t}</span>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}