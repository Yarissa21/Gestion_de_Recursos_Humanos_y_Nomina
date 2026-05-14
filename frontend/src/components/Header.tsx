import { Link } from "react-router-dom";

interface HeaderProps {
  rol: string;
  nombre: string;
}

export default function Header({ rol, nombre }: HeaderProps) {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <h3 className="text-2xl font-bold">Sistema de RRHH</h3>
        <div className="flex items-center gap-8 px-4 py-3">
          <Link to="/dashboard" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
            Dashboard
          </Link>
          {rol === "admin" && (
            <>
              <Link to="/configAreas" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Configuración
              </Link>
              <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
                Nómina
              </Link>
            </>
          )}
          {rol === "userrh" && (
            <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Nómina
            </Link>
          )}
          {rol === "user" && (
            <Link to="/nomina" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
              Nómina
            </Link>
          )}
          <Link to="/miPerfil" className="px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition">
            Mi Perfil
          </Link>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="px-4 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition ml-2"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
