import { Link, useNavigate, useLocation } from "react-router-dom";
import { permisos } from "../config/permisos";

interface HeaderProps {
  rol: string;
  nombre: string;
}

export default function Header({ rol, nombre }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const rolNormalizado = rol.toLowerCase();
  const permisosRol = permisos[rolNormalizado] ?? [];

  const handleRestrictedAccess = (path: string, seccion: string) => {
    if (permisosRol.includes(seccion)) {
      navigate(path);
    } else {
      alert("No tienes permisos para acceder a esta sección.");
    }
  };

  const navBtn = (path: string) =>
    location.pathname === path
      ? "flex items-center gap-2 px-4 py-2 rounded-md border-2 border-blue-600 text-blue-600 font-semibold transition"
      : "flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition";

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900">Sistema de RRHH</h3>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-2">

          {/* Dashboard - siempre visible */}
          <Link to="/dashboard" className={navBtn("/dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
            </svg>
            Dashboard
          </Link>

          {/* Mi Perfil - siempre visible */}
          <Link to="/miPerfil" className={navBtn("/miPerfil")}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Mi Perfil
          </Link>

          {/* Configuración - solo admin */}
          {permisosRol.includes("configAreas") && (
            <button onClick={() => handleRestrictedAccess("/configAreas", "configAreas")} className={navBtn("/configAreas")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuración
            </button>
          )}

          {/* Nómina */}
          {permisosRol.includes("nomina") && (
            <button onClick={() => handleRestrictedAccess("/nomina", "nomina")} className={navBtn("/nomina")}>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              {rolNormalizado === "user" ? "Mis Nóminas" : "Nómina"}
            </button>
          )}

          {/* Nombre del usuario */}
          <span className="text-sm text-gray-500 px-2 hidden md:block">
            {nombre}
          </span>

          {/* Cerrar sesión */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-600 hover:bg-red-50 hover:text-red-600 transition ml-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}