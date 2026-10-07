import type { ReactNode } from "react";
import "./admin_filters.css";

export interface AdminFilterOption {
  value: string;
  label: string;
}

interface AdminSelectFilterProps {
  label: string;
  value: string;
  options: AdminFilterOption[];
  on_change: (value: string) => void;
  all_label?: string;
}

// Filtro de lista desplegable. "" significa sin filtro.
export const AdminSelectFilter = ({ label, value, options, on_change, all_label = "Todos" }: AdminSelectFilterProps) => (
  <label className="admin_filter">
    <span className="admin_visually_hidden">{label}</span>
    <select
      className={`form_select admin_filter_select ${value ? "is_active" : ""}`}
      value={value}
      onChange={(event) => on_change(event.target.value)}
      aria-label={label}
    >
      <option value="">{`${label}: ${all_label}`}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

// Barra de búsqueda, filtros y acción principal de cada listado
export const AdminToolbar = ({ children }: { children: ReactNode }) => (
  <div className="admin_toolbar">{children}</div>
);
