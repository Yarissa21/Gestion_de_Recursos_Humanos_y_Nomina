import Header from "../../components/Header";
import YarissaFoto  from "../../assets/Yarissa.png";
import AnthonyFoto  from "../../assets/Anthony.png";
import CristinaFoto from "../../assets/Cristina.png";
import PedroFoto    from "../../assets/Pedro.png";
import YeniferFoto  from "../../assets/Yenifer.png";

interface Integrante {
  nombre: string;
  carnet: string;
  foto: string;
  github: string;
  backend?: string[];
  frontend?: string[];
  despliegue?: string[];
  documentacion?: string[];
}

const integrantes: Integrante[] = [
  {
    nombre: "Yarissa Alexandra Hernandez Mijangos",
    carnet: "1790-23-1812",
    foto: YarissaFoto,
    github: "https://github.com/Yarissa21",
    backend: [
      "Implementacion de base de datos con Prisma",
      "Modulo departamento",
      "Modulo puesto de trabajo",
      "Modulo de nomina",
      "Modulo de concepto nomina",
      "Modulo de empleados",
      "Arreglo de problemas de backend",
      "Implementacion de Swagger",
    ],
    frontend: ["Arreglo de problemas de frontend"],
    despliegue: ["Base de datos en Neon", "Frontend en Netlify"],
    documentacion: ["Manual tecnico"],
  },
  {
    nombre: "Anthony Obed Ortiz Ochoa",
    carnet: "1790-23-3899",
    foto: AnthonyFoto,
    github: "https://github.com/AnthonyOrtiz8A",
    backend: [
      "Modulo de academicos",
      "Modulo de tipo documento academico",
      "Modulo de reportes",
      "Implementacion de validaciones faltantes",
      "Arreglo de problemas de backend",
    ],
    frontend: [
      "Llamada de todos los modulos y diseno de la pagina",
      "Implementacion de mensajes de alerta y validaciones faltantes",
      "Arreglo de problemas de frontend",
    ],
    despliegue: ["Backend en Render"],
    documentacion: ["Manual de usuario", "Minutas semana 4 hasta finalizar"],
  },
  {
    nombre: "Maria Cristina Maldonado Leon",
    carnet: "1790-23-24987",
    foto: CristinaFoto,
    github: "https://github.com/Gamesjuegos25",
    backend: [
      "Modulo de auth (registro y login de usuarios)",
      "Modulo de usuarios",
      "Agregar permisos en otros modulos",
    ],
    frontend: [
      "Realizacion del login y permisos",
      "Plantilla principal de la pagina",
      "Unificacion de backend y frontend",
    ],
    documentacion: ["Redaccion de informe y dercas"],
  },
  {
    nombre: "Pedro Jose Barillas Melgar",
    carnet: "1790-22-17364",
    foto: PedroFoto,
    github: "https://github.com/PEDROJOSEGGGG",
    backend: ["Modulo de expediente", "Modulo validacion expediente"],
    documentacion: ["Apoyo en redaccion de informe", "Dercas"],
  },
  {
    nombre: "Yeniffer Nayeli Zepeda Ramirez",
    carnet: "1790-23-8589",
    foto: YeniferFoto,
    github: "https://github.com/yzepedar",
    documentacion: [
      "Redaccion de minutas hasta la semana 3",
      "Apoyo en redaccion de informe",
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
            <p className="text-sm text-gray-500 mt-0.5">Grupo No. 2 — Sistema de Gestion de RRHH y Nomina</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {[
            { color: "#185FA5", label: "Backend" },
            { color: "#0F6E56", label: "Frontend" },
            { color: "#BA7517", label: "Despliegue" },
            { color: "#993556", label: "Documentacion" },
          ].map((leyenda) => (
            <div key={leyenda.label} className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: leyenda.color }} />
              {leyenda.label}
            </div>
          ))}
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
          Integrantes y aportes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10">
          {integrantes.map((miembro) => (
            <div key={miembro.carnet} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <a href={miembro.github} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition">
                    <img src={miembro.foto} alt={miembro.nombre} className="w-full h-full object-cover" />
                  </div>
                </a>
                <div>
                  <a
                    href={miembro.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-gray-900 leading-tight hover:text-blue-600 transition block"
                  >
                    {miembro.nombre}
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">{miembro.carnet}</p>
                  <a
                    href={miembro.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition mt-1.5"
                  >
                    🔗 GitHub
                  </a>
                </div>
              </div>
              {miembro.backend && (
                <AporteSeccion label="Backend" items={miembro.backend} color="text-blue-600" icono="⚙️" />
              )}
              {miembro.frontend && (
                <AporteSeccion label="Frontend" items={miembro.frontend} color="text-emerald-700" icono="🖥️" />
              )}
              {miembro.despliegue && (
                <AporteSeccion label="Despliegue" items={miembro.despliegue} color="text-amber-700" icono="🚀" />
              )}
              {miembro.documentacion && (
                <AporteSeccion label="Documentacion" items={miembro.documentacion} color="text-pink-700" icono="📄" />
              )}
            </div>
          ))}
        </div>

        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">
          Stack tecnologico utilizado
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
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

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
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