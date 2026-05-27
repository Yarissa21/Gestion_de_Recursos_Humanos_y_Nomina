export function getRol(): string {
  return localStorage.getItem("rol")?.toLowerCase() || "";
}

export function isAdmin(): boolean {
  return getRol() === "admin";
}

export function isRH(): boolean {
  return getRol().includes("rh") || getRol() === "usuariorh";
}

export function isAdminOrRH(): boolean {
  return isAdmin() || isRH();
}

export function isUser(): boolean {
  return getRol() === "user";
}