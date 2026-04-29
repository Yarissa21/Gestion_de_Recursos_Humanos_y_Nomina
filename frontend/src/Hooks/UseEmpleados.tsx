import { useEffect, useState } from "react";
import { getEmpleados } from "../Services/EmpleadoService";
import { type Empleados } from "../Types/EmpleadosTypes";

export const useEmpleados = () => {
  const [empleados, setEmpleados] = useState<Empleados[]>([]);

  const loadEmpleados = async () => {
    const data = await getEmpleados();
    setEmpleados(data);
  };

  useEffect(() => {
    loadEmpleados();
  }, []);

  return { empleados, loadEmpleados };
};