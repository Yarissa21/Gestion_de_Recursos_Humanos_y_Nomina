// src/config/permisos.ts

export const permisos: Record<string, string[]> = {

  admin: ["configAreas", "nomina", "usuarios", "areas", "documentos"],
  userrh: ["nomina", "usuarios", "areas", "documentos"],
  usuariorh: ["nomina", "usuarios", "areas", "documentos"],
  user: ["nomina"],
  invitado: [],
};