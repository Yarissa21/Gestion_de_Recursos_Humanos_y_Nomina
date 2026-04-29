const API = "http://localhost:5173/Empleados";

export const getEmpleados = async () => {
  const res = await fetch(API);
  return res.json();
};

export const createEmpleados = async (data: any) => {
  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const updateEmpleados = async (id: number, data: any) => {
  await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

export const deleteEmpleados = async (id: number) => {
  await fetch(`${API}/${id}`, {
    method: "DELETE",
  });
};