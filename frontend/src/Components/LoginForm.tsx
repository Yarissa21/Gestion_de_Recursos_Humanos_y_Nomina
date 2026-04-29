import React, { useState } from "react";

interface Props {
  onLogin: (email: string, password: string, rol:string) => void;
}

const LoginForm: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setrol] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor ingresa correo y contraseña");
      return;
    }
    onLogin(email, password, rol);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
        />
      </div>
      <div>
        <label>Contraseña:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="********"
        />
      </div>
      <div>
        <label>Rol:</label>
        <input
          type="rol"
          value={rol}
          onChange={e => setrol(e.target.value)}
          placeholder="Administrador/Usuario "
        />
      </div>
      <button type="submit">Iniciar Sesion </button>
    </form>
  );
};

export default LoginForm;
