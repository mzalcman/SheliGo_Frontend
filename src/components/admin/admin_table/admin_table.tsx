import type { ReactNode } from "react";
import "./admin_table.css";

export interface AdminColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  // Columnas angostas (acciones, contadores) alineadas a la derecha
  align?: "left" | "right";
  width?: string;
  // En móvil (tarjetas) se oculta: p. ej. el botón "ver" cuando toda la tarjeta ya abre el detalle
  hide_on_mobile?: boolean;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  get_row_key: (row: T) => string;
  on_row_click?: (row: T) => void;
  // Mientras se recarga se atenúa la tabla en vez de vaciarla
  refreshing?: boolean;
  caption: string;
}

/* Tabla del backoffice. En escritorio es una tabla clásica; en pantallas
   chicas cada fila se muestra como tarjeta con el nombre de cada columna. */
const AdminTable = <T,>({ columns, rows, get_row_key, on_row_click, refreshing = false, caption }: AdminTableProps<T>) => (
  <div className={`admin_table_wrapper ${refreshing ? "is_refreshing" : ""}`} aria-busy={refreshing}>
    <table className="admin_table">
      <caption className="admin_visually_hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={column.align === "right" ? "align_right" : ""}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={get_row_key(row)}
            className={on_row_click ? "is_clickable" : ""}
            onClick={on_row_click ? () => on_row_click(row) : undefined}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                data-label={column.header}
                className={`${column.align === "right" ? "align_right" : ""} ${column.hide_on_mobile ? "hide_on_mobile" : ""}`}
              >
                {column.render(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminTable;
