import { useState, useEffect } from "react";
import { type Empleados } from "../Types/EmpleadosTypes";

interface Props {
  onSave: (empleados: Empleados) => void;
  EditarEmpleado?: Empleados | null;
}

function EmpleadoForm({ onSave, EditarEmpleado }: Props) {
  const [form, setForm] = useState<Empleados>({
    id: 0,
    nombre: "",
    apellido: "",
    dpi: "",
    salario: 0,
    estado: "",
  });

  useEffect(() => {
    if (EditarEmpleado) {
      setForm(EditarEmpleado);
    }
  }, [EditarEmpleado]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "salary"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validación básica
    if (!form.nombre || !form.apellido ||!form.dpi || form.salario<= 0 || form.estado) {
      alert("Completa todos los campos correctamente");
      return;
    }

    onSave(form);

    setForm({ id: 0, nombre: "", apellido: "", dpi:"",  salario: 0, estado:"" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{EditarEmpleado ? "Editar" : "Agregar"} Empleado</h2>

      <input
        name="nombre"
        placeholder="Nombre"
        value={form.nombre}
        onChange={handleChange}
      />

      <input
        name="apellido"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
      />

      <input
        name="salario"
        type="number"
        placeholder="Salario"
        value={form.salario}
        onChange={handleChange}
      />

      <input
        name="estado"
        type="Estado"
        placeholder="Estado"
        value={form.estado}
        onChange={handleChange}
      />

      <button type="submit">
        {EditarEmpleado ? "Actualizar" : "Guardar"}
      </button>
    </form>
  );
}

export default EmpleadoForm;