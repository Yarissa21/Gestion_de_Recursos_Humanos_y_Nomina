import Sidebar from './Components/sidebar';
import Dashboard from './Pages/Dashboard';
import Empleados from './Pages/Empleados';
import AdmiHome from './Pages/Roles/AdmiHome';
import EmpleadosHome from './Pages/Roles/EmpleadosHome';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <EmpleadosHome />
  );
}

export default App;