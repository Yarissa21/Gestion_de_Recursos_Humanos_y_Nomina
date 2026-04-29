import { type Empleados } from "../Types/EmpleadosTypes";

interface Props {
  empleados: Empleados[];
  onEdit: (empleados: Empleados) => void;
  onDelete: (id: number) => void;
}

function EmpleadoTabla({ empleados, onEdit, onDelete }: Props) {
  return (
    <table border={1}>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Puesto</th>
          <th>Salario</th>
          <th>Acciones</th>
        </tr>
      </thead>

      <tbody>
        {empleados.map((emp) => (
          <tr key={emp.id}>
            <td>{emp.nombre}</td>
            <td>{emp.apellido}</td>
            <td>{emp.dpi}</td>
            <td>{emp.salario}</td>
            <td>{emp.estado}</td>
            <td>
              <button onClick={() => onEdit(emp)}>Editar</button>
              <button onClick={() => onDelete(emp.id)}>
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default EmpleadoTabla;