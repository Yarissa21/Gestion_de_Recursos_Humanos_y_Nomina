import Sidebar from './Components/sidebar';
import Dashboard from './Pages/Dashboard';
import Empleados from './Pages/Empleados';

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;