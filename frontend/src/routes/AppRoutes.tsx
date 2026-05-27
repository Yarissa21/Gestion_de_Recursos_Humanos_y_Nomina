import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/index";
import Dashboard from "../pages/Dashboard/dash";
import MiPerfil from "../pages/Dashboard/miPerfil";
import ConfiguracionAreas from "../pages/Dashboard/configuracionAreas";
import Nomina from "../pages/Dashboard/nomina";
import ProtectedRoute from "./ProtectedRoutes";
import Puestos from "../pages/PuestosdeTrabajo/puestos";
import Documentos from "../pages/Documentos/documentos";
import Empleados from "../pages/Dashboard/empleados";
import Usuarios from "../pages/Dashboard/usuarios-sistema";
import UsuariosSistema from "../pages/Dashboard/usuarios-sistema";
import InformacionAcademica from "../pages/Documentos/informacion-academica";
import Expediente from "../pages/Documentos/expediente";
import TipoExpediente from "../pages/Documentos/tipo-expediente";
import ConceptosNomina from "../pages/Nominas/concepto";
import ValidacionExpediente from "../pages/Documentos/validacion-expediente";

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

        <Route path="/puestos" element={<Puestos />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/usuarios-sistema" element={<UsuariosSistema />} />
        <Route path="/informacion-academica" element={<InformacionAcademica />} />
        <Route path="/expediente" element={<Expediente />} />
        <Route path="/tipo-expediente" element={<TipoExpediente />} />
        <Route path="/conceptos" element={<ConceptosNomina />} />
        <Route path="/validacion-expediente" element={<ValidacionExpediente />} />
      </Routes>
    </BrowserRouter>
  );
}