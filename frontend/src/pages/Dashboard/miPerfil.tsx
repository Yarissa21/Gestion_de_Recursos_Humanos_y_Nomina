import { useEffect, useState, useRef  } from "react";
import Header from "../../components/Header";
import { fetchWithFallback } from "../../utils/api";

interface Empleado {
  id_empleado: number;
  nombre_empleado: string;
  apellido_empleado: string;
  dpi: string;
  fecha_nacimiento: string;
  direccion: string;
  telefono: string;
  correo: string;
  salario: number;
  estado: string;
}

interface TipoDoc {
  id_tipo: number;
  nombre: string;
  obligatorio: boolean;
}

interface TipoDocAcademico {
  id_tipo_doc_academico: number;
  nombre: string;
  obligatorio: boolean;
}

interface DocumentoExpediente {
  id_documento: number;
  nombre_documento: string;
  fecha_carga: string;
  id_tipo: number;
  tipo: { nombre: string };
}

interface DocumentoAcademico {
  id_doc_academico: number;
  nombre: string;
  fecha_carga: string;
  id_tipo_doc_academico: number;
  id_academico: number;
  tipo_doc: { nombre: string };
}

interface InformacionAcademica {
  id_academico: number;
  titulo: string;
  certificacion: string;
  institucion: string;
  fecha_graduacion: string;
}

const formatDPI = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 13);
  if (d.length <= 4) return d;
  if (d.length <= 9) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 9)}-${d.slice(9)}`;
};

const formatTel = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
};

const estadoBadge = (e: string) => {
  if (e === "Activo") return "bg-green-100 text-green-700";
  if (e === "Suspendido") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-600";
};

type TabActiva = "expediente" | "academico";

export default function MiPerfil() {
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [sinVincular, setSinVincular] = useState(false);

  const [tabActiva, setTabActiva] = useState<TabActiva>("expediente");

  const [tiposExp, setTiposExp] = useState<TipoDoc[]>([]);
  const [tiposAcad, setTiposAcad] = useState<TipoDocAcademico[]>([]);
  const [docsExp, setDocsExp] = useState<DocumentoExpediente[]>([]);
  const [docsAcad, setDocsAcad] = useState<DocumentoAcademico[]>([]);
  const [infoAcademica, setInfoAcademica] = useState<InformacionAcademica | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [modalDoc, setModalDoc] = useState<{
    categoria: "expediente" | "academico";
    modo: "subir" | "reemplazar";
    tipoId: number;
    docId?: number;
  } | null>(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const [subiendoDoc, setSubiendoDoc] = useState(false);
  const [errorDoc, setErrorDoc] = useState("");

  const [previstaUrl, setPrevistaUrl] = useState<string | null>(null);
  const [cargandoPrevia, setCargandoPrevia] = useState(false);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const rol = localStorage.getItem("rol")?.toLowerCase() || "sin rol";
  const rolDisplay = rol.toUpperCase();
  const token = localStorage.getItem("token");
  const id_usuario = localStorage.getItem("id_usuario") || "1";
  const headers = { Authorization: `Bearer ${token}` };

  const LOCAL = "http://localhost:3000";
  const REMOTE = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

  const getBase = async () => {
    try {
      await fetch(`${LOCAL}/health`, { signal: AbortSignal.timeout(2000) });
      return LOCAL;
    } catch { return REMOTE; }
  };

  const cargado = useRef(false);

    useEffect(() => {
    if (cargado.current) return;
    cargado.current = true;
    if (!token) return;
    if (rol === "admin") {
      setSinVincular(true);
      setLoading(false);
      return;
    }
    fetchWithFallback("/empleados/mi-perfil/completo", { headers })
      .then(r => r.json())
      .then((data) => {
        if (!data?.empleado) { setSinVincular(true); return; }
        setEmpleado(data.empleado);
        setTiposExp(Array.isArray(data.tiposExp) ? data.tiposExp : []);
        setTiposAcad(Array.isArray(data.tiposAcad) ? data.tiposAcad : []);
        setDocsExp(Array.isArray(data.docsExp) ? data.docsExp : []);
        if (Array.isArray(data.academicos) && data.academicos.length > 0) {
          const ac = data.academicos[0];
          setInfoAcademica(ac);
          setDocsAcad(Array.isArray(ac.documentos) ? ac.documentos : []);
        }
      })
      .catch(() => setSinVincular(true))
      .finally(() => setLoading(false));
  }, []);

  const cargarTodos = async (_id_empleado?: number) => {
    setLoadingDocs(true);
    try {
      const res = await fetchWithFallback("/empleados/mi-perfil/completo", { headers });
      const data = await res.json();
      console.log("DATA COMPLETO:", JSON.stringify(data?.academicos, null, 2));
      if (!data?.empleado) return;
      setTiposExp(Array.isArray(data.tiposExp) ? data.tiposExp : []);
      setTiposAcad(Array.isArray(data.tiposAcad) ? data.tiposAcad : []);
      setDocsExp(Array.isArray(data.docsExp) ? data.docsExp : []);
      if (Array.isArray(data.academicos) && data.academicos.length > 0) {
        const ac = data.academicos[0];
        setInfoAcademica(ac);
        setDocsAcad(Array.isArray(ac.documentos) ? ac.documentos : []);
      }
    } catch {
      setDocsExp([]);
      setDocsAcad([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const recargarDocs = async () => {
    if (empleado) await cargarTodos(empleado.id_empleado);
  };

  const abrirSubir = (categoria: "expediente" | "academico", tipoId: number, docId?: number) => {
    setModalDoc({ categoria, modo: docId ? "reemplazar" : "subir", tipoId, docId });
    setArchivoSeleccionado(null);
    setErrorDoc("");
  };

  const handleGuardarDoc = async () => {
    if (!archivoSeleccionado) { setErrorDoc("Selecciona un archivo PDF."); return; }
    if (!empleado) return;
    setSubiendoDoc(true);
    setErrorDoc("");

    try {
      const fd = new FormData();
      fd.append("file", archivoSeleccionado);

      if (modalDoc?.categoria === "expediente") {
        if (modalDoc.modo === "subir") {
          fd.append("id_tipo", String(modalDoc.tipoId));
          fd.append("id_empleado", String(empleado.id_empleado));
          fd.append("id_usuario", id_usuario);
          const res = await fetchWithFallback("/expediente/documento", { method: "POST", headers, body: fd });
          if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error"); }
        } else {
          const res = await fetchWithFallback(`/expediente/documento/${modalDoc.docId}`, { method: "PUT", headers, body: fd });
          if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error"); }
        }
      } else {
        if (!infoAcademica) { setErrorDoc("No tienes información académica registrada."); setSubiendoDoc(false); return; }
        if (modalDoc?.modo === "subir") {
          fd.append("id_academico", String(infoAcademica.id_academico));
          fd.append("id_tipo_doc_academico", String(modalDoc.tipoId));
          fd.append("id_usuario", id_usuario);
          const res = await fetchWithFallback("/academicos/documento", { method: "POST", headers, body: fd });
          if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error"); }
        } else {
          const res = await fetchWithFallback(`/academicos/documento/${modalDoc?.docId}`, { method: "PUT", headers, body: fd });
          if (!res.ok) { const e = await res.json(); throw new Error(e.message || "Error"); }
        }
      }

      setModalDoc(null);
      await recargarDocs();
    } catch (e: any) {
      setErrorDoc(e.message || "No se pudo subir el documento.");
    } finally {
      setSubiendoDoc(false);
    }
  };

  const abrirPrevia = async (categoria: "expediente" | "academico", id: number) => {
    setCargandoPrevia(true);
    setPrevistaUrl(null);
    try {
      const base = await getBase();
      const url = categoria === "expediente"
        ? `${base}/expediente/documento/${id}/archivo`
        : `${base}/academicos/documento/${id}/archivo`;
      const res = await fetch(url, { headers });
      const blob = await res.blob();
      setPrevistaUrl(URL.createObjectURL(blob));
    } catch {
      alert("No se pudo cargar el documento.");
    } finally {
      setCargandoPrevia(false);
    }
  };

  const descargar = async (categoria: "expediente" | "academico", id: number, nombreArchivo: string) => {
    const base = await getBase();
    const url = categoria === "expediente"
      ? `${base}/expediente/documento/${id}/archivo?download=true`
      : `${base}/academicos/documento/${id}/archivo?download=true`;
    const res = await fetch(url, { headers });
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = nombreArchivo;
    a.click();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <Header rol={rol} nombre={nombre} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <p className="text-gray-400 text-sm font-medium">Cargando...</p>
        </div>
      ) : (
        <main className="max-w-3xl mx-auto px-6 mt-10">

          <div className="flex items-center gap-3 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Cuenta</h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-blue-600 text-xl font-bold">{nombre.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">{nombre}</p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  rol === "admin" ? "bg-purple-100 text-purple-700"
                  : rol === "userrh" || rol === "usuariorh" ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
                }`}>
                  {rolDisplay}
                </span>
              </div>
            </div>
          </div>

          {rol === "admin" && sinVincular ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400">
              <p className="text-sm">Los administradores no tienen perfil de empleado vinculado.</p>
            </div>
          ) : sinVincular ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-gray-500 font-medium">No tienes un perfil de empleado vinculado</p>
              <p className="text-gray-400 text-sm mt-1">Contacta al administrador para vincular tu cuenta.</p>
            </div>
          ) : empleado ? (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Nombre completo</p>
                    <p className="text-sm font-medium">{empleado.nombre_empleado} {empleado.apellido_empleado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">DPI</p>
                    <p className="text-sm font-medium">{formatDPI(empleado.dpi)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Fecha de nacimiento</p>
                    <p className="text-sm font-medium">
                      {empleado.fecha_nacimiento ? new Date(empleado.fecha_nacimiento).toLocaleDateString("es-GT") : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Teléfono</p>
                    <p className="text-sm font-medium">{formatTel(empleado.telefono)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Correo</p>
                    <p className="text-sm font-medium">{empleado.correo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Dirección</p>
                    <p className="text-sm font-medium">{empleado.direccion}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Información Laboral</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Salario</p>
                    <p className="text-sm font-medium">Q {empleado.salario.toLocaleString("es-GT", { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Estado</p>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${estadoBadge(empleado.estado)}`}>
                      {empleado.estado}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Mis Documentos</h2>

                <div className="flex gap-1 mb-5 bg-gray-50 rounded-lg p-1 w-fit">
                  <button onClick={() => setTabActiva("expediente")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tabActiva === "expediente" ? "bg-amber-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Expediente
                  </button>
                  <button onClick={() => setTabActiva("academico")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${tabActiva === "academico" ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    Académicos
                  </button>
                </div>

                {loadingDocs ? (
                  <p className="text-gray-400 text-sm text-center py-6">Cargando documentos...</p>
                ) : tabActiva === "expediente" ? (
                  <div className="flex flex-col gap-3">
                    {tiposExp.map((tipo) => {
                      const docExistente = docsExp.find((d) => Number(d.id_tipo) === Number(tipo.id_tipo));
                      return (
                        <div key={tipo.id_tipo}
                          className={`flex items-center justify-between border rounded-lg px-4 py-3 ${docExistente ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${docExistente ? "bg-green-400" : "bg-gray-300"}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800">{tipo.nombre}</p>
                              {docExistente && (
                                <p className="text-xs text-gray-500 truncate">{docExistente.nombre_documento} · {new Date(docExistente.fecha_carga).toLocaleDateString("es-GT")}</p>
                              )}
                            </div>
                            {tipo.obligatorio && <span className="text-xs text-red-500 font-medium ml-2 shrink-0">Req.</span>}
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-3">
                            {docExistente ? (
                              <>
                                <button onClick={() => abrirPrevia("expediente", docExistente.id_documento)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Ver">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                  </svg>
                                </button>
                                <button onClick={() => descargar("expediente", docExistente.id_documento, docExistente.nombre_documento)} className="text-gray-400 hover:text-green-600 transition p-1.5 rounded-md hover:bg-green-50" title="Descargar">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                  </svg>
                                </button>
                                <button onClick={() => abrirSubir("expediente", tipo.id_tipo, docExistente.id_documento)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Reemplazar">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                  </svg>
                                </button>
                              </>
                            ) : (
                              <button onClick={() => abrirSubir("expediente", tipo.id_tipo)}
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
                ) : (
                  <>
                    {!infoAcademica ? (
                      <div className="text-center py-6">
                        <p className="text-gray-400 text-sm">No tienes información académica registrada.</p>
                        <p className="text-gray-400 text-xs mt-1">Contacta al administrador para registrar tu información académica.</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
                          <p className="text-xs text-gray-400 mb-0.5">Título registrado</p>
                          <p className="text-sm font-medium text-gray-800">{infoAcademica.titulo}</p>
                          <p className="text-xs text-gray-500">{infoAcademica.institucion} · {infoAcademica.certificacion}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                          {tiposAcad.map((tipo) => {
                            const docExistente = docsAcad.find((d) => Number(d.id_tipo_doc_academico) === Number(tipo.id_tipo_doc_academico));
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
                                      <button onClick={() => abrirPrevia("academico", docExistente.id_doc_academico)} className="text-gray-400 hover:text-blue-600 transition p-1.5 rounded-md hover:bg-blue-50" title="Ver">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                                        </svg>
                                      </button>
                                      <button onClick={() => descargar("academico", docExistente.id_doc_academico, docExistente.nombre)} className="text-gray-400 hover:text-green-600 transition p-1.5 rounded-md hover:bg-green-50" title="Descargar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                          <polyline points="7 10 12 15 17 10" />
                                          <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                      </button>
                                      <button onClick={() => abrirSubir("academico", tipo.id_tipo_doc_academico, docExistente.id_doc_academico)} className="text-gray-400 hover:text-amber-600 transition p-1.5 rounded-md hover:bg-amber-50" title="Reemplazar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                      </button>
                                    </>
                                  ) : (
                                    <button onClick={() => abrirSubir("academico", tipo.id_tipo_doc_academico)}
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
                      </>
                    )}
                  </>
                )}
              </div>
            </>
          ) : null}
        </main>
      )}

      {modalDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {modalDoc.modo === "subir" ? "Subir Documento" : "Reemplazar Documento"}
              </h3>
              <button onClick={() => setModalDoc(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {errorDoc && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md px-4 py-3">{errorDoc}</div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">Archivo PDF</label>
            <div
              className={`border-2 border-dashed rounded-md p-4 mb-5 text-center cursor-pointer transition ${archivoSeleccionado ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              onClick={() => document.getElementById("input-mi-perfil-doc")?.click()}
            >
              <input id="input-mi-perfil-doc" type="file" accept=".pdf" className="hidden"
                onChange={(e) => setArchivoSeleccionado(e.target.files?.[0] || null)}
              />
              {archivoSeleccionado ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-blue-700 font-medium truncate">{archivoSeleccionado.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setArchivoSeleccionado(null); }} className="text-gray-400 hover:text-red-500">
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
                {subiendoDoc ? "Subiendo..." : modalDoc.modo === "subir" ? "Subir" : "Reemplazar"}
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

      {(previstaUrl || cargandoPrevia) && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <p className="font-semibold text-sm">Vista previa</p>
              <button onClick={() => setPrevistaUrl(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {cargandoPrevia ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400 text-sm">Cargando documento...</p>
                </div>
              ) : (
                <iframe src={previstaUrl!} className="w-full h-full rounded-b-xl" title="Vista previa" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}