import { useEffect, useState } from "react";
import { type Empleados } from "../Types/EmpleadosTypes";
import {
  getEmpleados,
} from "../Services/EmpleadoService";

function EmpleadosPages() {
  const [, setEmpleados] = useState<Empleados[]>([]);

  const loadEmpleados = async () => {
    const data = await getEmpleados();
    setEmpleados(data);
  };

  useEffect(() => {
    loadEmpleados();
  }, []);

  return <div>Interfaz</div>;
}

export default EmpleadosPages;