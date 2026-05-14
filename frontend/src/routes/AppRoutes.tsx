import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/index";
import Dashboard from "../pages/Dashboard/dash";
import MiPerfil from "../pages/Dashboard/miPerfil";
import ConfiguracionAreas from "../pages/Dashboard/configuracionAreas";
import Nomina from "../pages/Dashboard/nomina";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/miPerfil" element={<MiPerfil/>}/>
        <Route path="/configAreas" element={<ConfiguracionAreas/>}/>
        <Route path="/nomina" element={<Nomina />} />



      </Routes>
    </BrowserRouter>
  );
}
