const LOCAL_URL = "http://localhost:3000";
const REMOTE_URL = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

let usarLocal: boolean | null = null;
let ultimaVerificacion = 0;
const CACHE_VERIFICACION = 30000;

async function verificarLocal(): Promise<boolean> {
  const ahora = Date.now();
  if (usarLocal !== null && ahora - ultimaVerificacion < CACHE_VERIFICACION) {
    return usarLocal;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    await fetch(`${LOCAL_URL}/departamentos`, { signal: controller.signal });
    clearTimeout(timeout);
    usarLocal = true;
  } catch {
    usarLocal = false;
  }

  ultimaVerificacion = Date.now();
  return usarLocal;
}

export async function fetchWithFallback(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const localDisponible = await verificarLocal();

  if (localDisponible) {
    try {
      const res = await fetch(`${LOCAL_URL}${path}`, options);
      return res;
    } catch {
      usarLocal = false;
      return fetch(`${REMOTE_URL}${path}`, options);
    }
  }

  return fetch(`${REMOTE_URL}${path}`, options);
}