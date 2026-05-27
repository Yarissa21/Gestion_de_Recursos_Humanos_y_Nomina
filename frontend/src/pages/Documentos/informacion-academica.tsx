import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Header from "../../components/Header";
import { isAdminOrRH } from "../../utils/auth";import { fetchWithFallback } from "../../utils/api";

interface EmpleadoBasico {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
}

interface TipoDocAcademico {
  id_tipo_doc_academico: number;
  nombre: string;
  obligatorio: boolean;
}

interface DocumentoAcademico {
  id_doc_academico: number;
  nombre: string;
  archivo: string;
  fecha_carga: string;
  id_academico: number;
  id_tipo_doc_academico: number;
  tipo_doc: { nombre: string };
}

interface InformacionAcademica {
  id_academico: number;
  titulo: string;
  certificacion: string;
  institucion: string;
  fecha_graduacion: string;
  id_empleado: number;
  // El backend incluye el objeto empleado completo
  empleado: EmpleadoBasico;
}

const parseError = (err: any): string => {
  if (!err) return "Error desconocido";
  if (typeof err.message === "string") return err.message;
  if (Array.isArray(err.message)) return err.message.join(", ");
  return "Error desconocido";
};

const emptyForm = {
  titulo: "",
  certificacion: "",
  institucion: "",
  fecha_graduacion: "",
  id_empleado: "",
};

export default function InformacionAcademica() {
  if (!isAdminOrRH()) return <Navigate to="/dashboard" replace />;
  const [empleados, setEmpleados] = useState<EmpleadoBasico[]>([]);
  const [academicos, setAcademicos] = useState<InformacionAcademica[]>([]);
  const [tiposDoc, setTiposDoc] = useState<TipoDocAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const [empSeleccionado, setEmpSeleccionado] = useState<number | "todos">("todos");
  const [busqueda, setBusqueda] = useState("");

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<InformacionAcademica | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");

  const [academicoActivo, setAcademicoActivo] = useState<InformacionAcademica | null>(null);
  const [docsAcademico, setDocsAcademico] = useState<DocumentoAcademico[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [modalDoc, setModalDoc] = useState<{ modo: "crear" | "editar"; doc?: DocumentoAcademico; tipoId?: number } | null>(null);
  const [archivoDoc, setArchivoDoc] = useState<File | null>(null);
  const [nuevoNombreDoc, setNuevoNombreDoc] = useState("");
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorDoc, setErrorDoc] = useState("");

  const [previstaDoc, setPrevistaDoc] = useState<DocumentoAcademico | null>(null);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const token = localStorage.getItem("token");
  const id_usuario = localStorage.getItem("id_usuario") || "1";
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const cargarDatos = () => {
    setLoading(true);
    Promise.all([
      fetchWithFallback("/empleados", { headers }).then((r) => r.json()),
      fetchWithFallback("/academicos", { headers }).then((r) => r.json()),
      fetchWithFallback("/tipos-documento-academico", { headers }).then((r) => r.json()),
    ])
      .then(([emps, acads, tipos]) => {
        setEmpleados(Array.isArray(emps) ? emps : []);
        setAcademicos(Array.isArray(acads) ? acads : []);
        setTiposDoc(Array.isArray(tipos) ? tipos : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargarDatos(); }, []);

  // Carga documentos del académico activo filtrando por id_academico
  const cargarDocsAcademico = async (id_academico: number) => {
    setLoadingDocs(true);
    try {
      const res = await fetchWithFallback("/academicos/documentos", { headers });
      const data = await res.json();
      // Filtra por id_academico — el campo viene en la raíz del documento
      const docs = Array.isArray(data)
        ? data.filter((d: any) => Number(d.id_academico) === Number(id_academico))
        : [];
      setDocsAcademico(docs);
    } catch {
      setDocsAcademico([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Usa el empleado incluido en el response del backend directamente
  const getNombreEmp = (ac: InformacionAcademica): string => {
    if (ac.empleado) {
      return `${ac.empleado.nombre_empleado} ${ac.empleado.apellido_empleado}`;
    }
    // Fallback: buscar en el array local
    const emp = empleados.find((e) => e.id_empleado === ac.id_empleado);
    return emp ? `${emp.nombre_empleado} ${emp.apellido_empleado}` : "—";
  };

  const abrirCrear = () => { setEditando(null); setForm(emptyForm); setErrorGlobal(""); setMostrarModal(true); };

  const abrirEditar = (ac: InformacionAcademica) => {
    setEditando(ac);
    setForm({
      titulo: ac.titulo,
      certificacion: ac.certificacion,
      institucion: ac.institucion,
      fecha_graduacion: ac.fecha_graduacion ? ac.fecha_graduacion.split("T")[0] : "",
      id_empleado: String(ac.id_empleado),
    });
    setErrorGlobal("");
    setMostrarModal(true);
  };

  const handleGuardar = async () => {
    if (!form.titulo.trim() || !form.certificacion.trim() || !form.institucion.trim() || !form.fecha_graduacion || !form.id_empleado) {
      setErrorGlobal("Todos los campos son obligatorios.");
      return;
    }
    setGuardando(true);
    setErrorGlobal("");
    try {
      const body = {
        titulo: form.titulo.trim(),
        certificacion: form.certificacion.trim(),
        institucion: form.institucion.trim(),
        fecha_graduacion: `${form.fecha_graduacion}T12:00:00.000Z`,
        id_empleado: Number(form.id_empleado),
      };
      const res = editando
        ? await fetchWithFallback(`/academicos/${editando.id_academico}`, { method: "PUT", headers, body: JSON.stringify(body) })
        : await fetchWithFallback("/academicos", { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      setMostrarModal(false);
      cargarDatos();
    } catch (e: any) {
      setErrorGlobal(e.message || "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (ac: InformacionAcademica) => {
    if (!confirm(`¿Eliminar "${ac.titulo}"?`)) return;
    try {
      const res = await fetchWithFallback(`/academicos/academico/${ac.id_academico}/${ac.id_empleado}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      cargarDatos();
    } catch (e: any) { alert(e.message || "No se pudo eliminar."); }
  };

  const abrirDocs = async (ac: InformacionAcademica) => {
    setAcademicoActivo(ac);
    await cargarDocsAcademico(ac.id_academico);
  };

  const abrirSubirDoc = (tipoId: number) => {
    setModalDoc({ modo: "crear", tipoId });
    setArchivoDoc(null);
    setErrorDoc("");
  };

  const abrirEditarDoc = (doc: DocumentoAcademico) => {
    setModalDoc({ modo: "editar", doc });
    setArchivoDoc(null);
    setNuevoNombreDoc(doc.nombre);
    setErrorDoc("");
  };

  const handleGuardarDoc = async () => {
    if (!academicoActivo) return;

    if (modalDoc?.modo === "crear") {
      if (!archivoDoc || !modalDoc.tipoId) { setErrorDoc("Selecciona un archivo."); return; }
      setSubiendoDoc(true);
      setErrorDoc("");
      try {
        const fd = new FormData();
        fd.append("file", archivoDoc);
        // Enviar el id_academico del académico activo
        fd.append("id_academico", String(academicoActivo.id_academico));
        fd.append("id_tipo_doc_academico", String(modalDoc.tipoId));
        fd.append("id_usuario", id_usuario);
        const res = await fetchWithFallback("/academicos/documento", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
        setModalDoc(null);
        await cargarDocsAcademico(academicoActivo.id_academico);
      } catch (e: any) { setErrorDoc(e.message || "No se pudo subir."); }
      finally { setSubiendoDoc(false); }

    } else if (modalDoc?.modo === "editar" && modalDoc.doc) {
      setSubiendoDoc(true);
      setErrorDoc("");
      try {
        const fd = new FormData();
        if (nuevoNombreDoc.trim()) fd.append("nombre", nuevoNombreDoc.trim());
        if (archivoDoc) fd.append("file", archivoDoc);
        const res = await fetchWithFallback(`/academicos/documento/${modalDoc.doc.id_doc_academico}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
        setModalDoc(null);
        await cargarDocsAcademico(academicoActivo.id_academico);
      } catch (e: any) { setErrorDoc(e.message || "No se pudo actualizar."); }
      finally { setSubiendoDoc(false); }
    }
  };

  const handleEliminarDoc = async (doc: DocumentoAcademico) => {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    try {
      const res = await fetchWithFallback(`/academicos/documento/${doc.id_doc_academico}`, { method: "DELETE", headers });
      if (!res.ok) { const err = await res.json(); throw new Error(parseError(err)); }
      if (academicoActivo) await cargarDocsAcademico(academicoActivo.id_academico);
    } catch { alert("No se pudo eliminar."); }
  };

  const handleDescargarDoc = async (doc: DocumentoAcademico) => {
    const LOCAL = "http://localhost:3000";
    const REMOTE = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";
    let base = LOCAL;
    try { await fetch(`${LOCAL}/departamentos`, { signal: AbortSignal.timeout(2000) }); } catch { base = REMOTE; }
    const a = document.createElement("a");
    a.href = `${base}/academicos/documento/${doc.id_doc_academico}/archivo?download=true`;
    a.download = doc.nombre;
    a.click();
  };

  const academicosFiltrados = academicos.filter((ac) => {
    if (empSeleccionado !== "todos" && ac.id_empleado !== empSeleccionado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      return (
        ac.titulo.toLowerCase().includes(q) ||
        ac.institucion.toLowerCase().includes(q) ||
        ac.certificacion.toLowerCase().includes(q) ||
        getNombreEmp(ac).toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-7xl mx-auto px-6 mt-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              <h1 className="text-3xl font-bold">Información Académica</h1>
            </div>
            <button onClick={abrirCrear} className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nuevo Registro
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Buscar por título, institución, empleado..."
                value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="border border-gray-300 rounded-md pl-9 pr-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={empSeleccionado}
              onChange={(e) => setEmpSeleccionado(e.target.value === "todos" ? "todos" : Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
            >
              <option value="todos">Todos los empleados</option>
              {empleados.map((emp) => (
                <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
              ))}
            </select>
            <span className="text-sm text-gray-400 ml-auto">{academicosFiltrados.length} registro{academicosFiltrados.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {academicosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-400 mb-4">No hay registros académicos</p>
                <button onClick={abrirCrear} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition font-medium text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Crear primer registro
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="p-4 text-left font-medium">Empleado</th>
                    <th className="p-4 text-left font-medium">Título</th>
                    <th className="p-4 text-left font-medium">Certificación</th>
                    <th className="p-4 text-left font-medium">Institución</th>
                    <th className="p-4 text-left font-medium">Fecha Graduación</th>
                    <th className="p-4 text-center font-medium">Documentos</th>
                    <th className="p-4 text-center font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {academicosFiltrados.map((ac) => (
                    <tr key={ac.id_academico} className="border-t hover:bg-gray-50 transition">
                      <td className="p-4 text-sm font-medium">{getNombreEmp(ac)}</td>
                      <td className="p-4 text-sm">{ac.titulo}</td>
                      <td className="p-4 text-sm text-gray-600">{ac.certificacion}</td>
                      <td className="p-4 text-sm text-gray-600">{ac.institucion}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {ac.fecha_graduacion ? new Date(ac.fecha_graduacion).toLocaleDateString("es-GT") : "—"}
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => abrirDocs(ac)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                          </svg>
                          Ver docs
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => abrirEditar(ac)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button onClick={() => handleEliminar(ac)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" /><path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      )}

      {/* ── Modal Crear/Editar ── */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editando ? "Editar Registro" : "Nuevo Registro Académico"}</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {errorGlobal && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorGlobal}</div>}
            <div className="flex flex-col gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empleado</label>
                <select value={form.id_empleado} onChange={(e) => setForm((p) => ({ ...p, id_empleado: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editando}
                >
                    <option value="">Seleccionar empleado</option>
                    {empleados
                    .filter((emp) => !academicos.some((ac) => ac.id_empleado === emp.id_empleado))
                    .map((emp) => (
                        <option key={emp.id_empleado} value={emp.id_empleado}>{emp.nombre_empleado} {emp.apellido_empleado}</option>
                    ))
                    }
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input type="text" placeholder="Ej: Licenciatura en Administración" value={form.titulo}
                  onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certificación</label>
                <input type="text" placeholder="Ej: Título universitario" value={form.certificacion}
                  onChange={(e) => setForm((p) => ({ ...p, certificacion: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                <input type="text" placeholder="Ej: Universidad de San Carlos" value={form.institucion}
                  onChange={(e) => setForm((p) => ({ ...p, institucion: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Graduación</label>
                <input type="date" value={form.fecha_graduacion}
                  onChange={(e) => setForm((p) => ({ ...p, fecha_graduacion: e.target.value }))}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGuardar} disabled={guardando}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {guardando ? "Guardando..." : editando ? "Actualizar" : "Crear"}
              </button>
              <button onClick={() => setMostrarModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Panel Documentos ── */}
      {academicoActivo && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Documentos Académicos</h3>
                <p className="text-sm text-gray-500">{academicoActivo.titulo} · {getNombreEmp(academicoActivo)}</p>
              </div>
              <button onClick={() => { setAcademicoActivo(null); setDocsAcademico([]); }} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {loadingDocs ? (
              <p className="text-gray-400 text-center py-6">Cargando...</p>
            ) : (
              <div className="flex flex-col gap-3">
                {tiposDoc.map((tipo) => {
                  const docExistente = docsAcademico.find(
                    (d) => Number(d.id_tipo_doc_academico) === Number(tipo.id_tipo_doc_academico)
                  );
                  return (
                    <div key={tipo.id_tipo_doc_academico}
                      className={`flex items-center justify-between border rounded-lg px-4 py-3 ${docExistente ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${docExistente ? "bg-green-400" : "bg-gray-300"}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800">{tipo.nombre}</p>
                          {docExistente && (
                            <p className="text-xs text-gray-500 truncate">{docExistente.nombre} · {new Date(docExistente.fecha_carga).toLocaleDateString("es-GT")}</p>
                          )}
                        </div>
                        {tipo.obligatorio && <span className="text-xs text-red-500 font-medium ml-2 shrink-0">Req.</span>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-3">
                        {docExistente ? (
                          <>
                            <button onClick={() => setPrevistaDoc(docExistente)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Vista previa">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                              </svg>
                            </button>
                            <button onClick={() => handleDescargarDoc(docExistente)} className="text-gray-400 hover:text-green-600 transition p-1.5 rounded-md hover:bg-green-50" title="Descargar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                            </button>
                            <button onClick={() => abrirEditarDoc(docExistente)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Editar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button onClick={() => handleEliminarDoc(docExistente)} className="text-gray-400 hover:text-red-600 transition p-1.5 rounded-md hover:bg-red-50" title="Eliminar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" /><path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button onClick={() => abrirSubirDoc(tipo.id_tipo_doc_academico)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Subir
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Subir / Editar Doc ── */}
      {modalDoc && academicoActivo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{modalDoc.modo === "crear" ? "Subir Documento" : "Editar Documento"}</h3>
              <button onClick={() => setModalDoc(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {errorDoc && <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorDoc}</div>}
            {modalDoc.modo === "editar" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input type="text" value={nuevoNombreDoc}
                  onChange={(e) => setNuevoNombreDoc(e.target.value)}
                  className="border border-gray-300 rounded-md w-full p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modalDoc.modo === "crear" ? "Archivo PDF" : "Reemplazar archivo (opcional)"}
            </label>
            <div
              className={`border-2 border-dashed rounded-md p-4 mb-5 text-center cursor-pointer transition ${archivoDoc ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => document.getElementById("input-doc-modal")?.click()}
            >
              <input id="input-doc-modal" type="file" accept=".pdf" className="hidden"
                onChange={(e) => setArchivoDoc(e.target.files?.[0] || null)}
              />
              {archivoDoc ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-blue-700 font-medium truncate">{archivoDoc.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setArchivoDoc(null); }} className="text-gray-400 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs">Click para seleccionar PDF</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={handleGuardarDoc} disabled={subiendoDoc}
                className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-medium disabled:opacity-60"
              >
                {subiendoDoc ? "Guardando..." : modalDoc.modo === "crear" ? "Subir" : "Guardar"}
              </button>
              <button onClick={() => setModalDoc(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Vista Previa ── */}
      {previstaDoc && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-70 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <p className="font-semibold text-sm">{previstaDoc.nombre}</p>
              <button onClick={() => setPrevistaDoc(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe src={`data:application/pdf;base64,${previstaDoc.archivo}`} className="w-full h-full rounded-b-xl" title="Vista previa" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}