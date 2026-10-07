import { useMemo, useState } from "react";
import type { AdminOption } from "../../../services/admin/admin_options_service";

interface AdminInstitutionChecklistProps {
  options: AdminOption[];
  selected: string[];
  on_change: (ids: string[]) => void;
  label: string;
}

// Lista de instituciones con casillas y filtro por nombre
const AdminInstitutionChecklist = ({ options, selected, on_change, label }: AdminInstitutionChecklistProps) => {
  const [filter, set_filter] = useState("");
  const visible = useMemo(() => {
    const text = filter.trim().toLowerCase();
    return text ? options.filter((option) => option.nombre.toLowerCase().includes(text)) : options;
  }, [options, filter]);

  const toggle = (id: string) =>
    on_change(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id]);

  return (
    <div className="form_field">
      <span className="form_label">{label}</span>
      {options.length > 6 && (
        <input className="form_input" placeholder="Filtrar instituciones" value={filter}
          onChange={(event) => set_filter(event.target.value)} aria-label="Filtrar instituciones" />
      )}
      <div className="admin_check_list" role="group" aria-label={label}>
        {options.length === 0 && <p className="admin_check_item admin_muted">Cargando instituciones...</p>}
        {visible.map((option) => (
          <label key={option.id} className="admin_check_item">
            <input type="checkbox" checked={selected.includes(option.id)} onChange={() => toggle(option.id)} />
            {option.nombre}
          </label>
        ))}
      </div>
      <span className="form_hint">{selected.length} seleccionada(s)</span>
    </div>
  );
};

export default AdminInstitutionChecklist;
