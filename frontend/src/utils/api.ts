const LOCAL_URL = "http://localhost:3000";
const REMOTE_URL = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

export async function fetchWithFallback(
  path: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);

    const localRes = await fetch(`${LOCAL_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // SI localhost responde 404/500/etc -> usar Render
    if (!localRes.ok) {
      console.warn("Local falló, usando Render:", path);

      return fetch(`${REMOTE_URL}${path}`, options);
    }

    return localRes;
  } catch (err: any) {
    console.warn("Local no disponible, usando Render:", path);

    return fetch(`${REMOTE_URL}${path}`, options);
  }
}