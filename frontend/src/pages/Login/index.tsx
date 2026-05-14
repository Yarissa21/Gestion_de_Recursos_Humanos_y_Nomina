import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, password }),
      });

      if (!response.ok) throw new Error("Credenciales inválidas");

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("rol", data.usuario.rol);
      localStorage.setItem("nombre",data.usuario.nombre);

      // ✅ Redirigir al dashboard
      navigate("/dashboard");
    } catch (error: any) {
      alert("Error en login: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center mt-12">
      <h1 className="text-2xl font-bold mb-4">Pantalla de Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-64">
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}
