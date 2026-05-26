export const permisos: Record<string, string[]> = {
  admin: ["configAreas", "nomina", "usuarios", "areas", "documentos", "expediente", "informacion-academica", "tipo-expediente"],
  userrh: ["nomina", "usuarios", "areas", "documentos", "expediente", "informacion-academica"],
  usuariorh: ["nomina", "usuarios", "areas", "documentos", "expediente", "informacion-academica"],
  user: ["nomina"],
  invitado: [],
};