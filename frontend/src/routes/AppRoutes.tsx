import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/index";
import Dashboard from "../pages/Dashboard/dash";
import MiPerfil from "../pages/Dashboard/miPerfil";
import ConfiguracionAreas from "../pages/Dashboard/configuracionAreas";
import Nomina from "../pages/Dashboard/nomina";
import ProtectedRoute from "./ProtectedRoutes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/configAreas" element={<ProtectedRoute><ConfiguracionAreas /></ProtectedRoute>} />
        <Route path="/nomina" element={<ProtectedRoute><Nomina /></ProtectedRoute>} />
        <Route path="/miPerfil" element={<ProtectedRoute><MiPerfil /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}