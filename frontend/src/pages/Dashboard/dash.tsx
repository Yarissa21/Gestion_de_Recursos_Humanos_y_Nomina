import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // 👈 usa la ruta correcta
    }
  }, [navigate]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Bienvenido al Dashboard</h1>
      <p>Contenido privado solo para usuarios logueados.</p>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          navigate("/login"); // 👈 logout redirige al login
        }}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
