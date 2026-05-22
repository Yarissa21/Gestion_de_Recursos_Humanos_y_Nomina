const LOCAL_URL = "http://localhost:3000";
const REMOTE_URL = "https://gestion-de-recursos-humanos-y-nomina.onrender.com";

export async function fetchWithFallback(
  path: string,
  options?: RequestInit
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 500);

    const res = await fetch(`${LOCAL_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeout);
    return res;
  } catch (err: any) {
    return fetch(`${REMOTE_URL}${path}`, options);
  }
}