import Sidebar from './Components/sidebar';
import Dashboard from './Pages/Dashboard';
import Empleados from './Pages/Empleados';
import Academico from './Pages/Academico';
import Reporte from './Pages/Reporte';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />

        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/empleados" element={<Empleados />} />
            <Route path="/academico" element={<Academico />} />
            <Route path="/reporte" element={<Reporte />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;