import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/index";
import Dashboard from "../pages/Dashboard/dash";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirige la raíz hacia /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas principales */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
