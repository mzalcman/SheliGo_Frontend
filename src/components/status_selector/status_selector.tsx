import "./status_selector.css";
import { Search, PackageCheck } from "lucide-react";

interface StatusSelectorProps {
  value: string;
  onChange: (value: string) => void;
  has_error?: boolean;
}

const OPTIONS = [
  { value: "perdido", label: "Perdido", description: "Estoy buscando algo", icon: Search },
  { value: "encontrado", label: "Encontrado", description: "Encontré algo ajeno", icon: PackageCheck },
];

/* Selector visual de estado (reemplaza al <select>). Solo presentación:
   el valor y el manejo del cambio los define la página que lo usa. */
const StatusSelector = ({ value, onChange, has_error = false }: StatusSelectorProps) => {
  return (
    <div
      className={`status_selector ${has_error ? "status_selector_error" : ""}`}
      role="radiogroup"
      aria-label="Estado del objeto"
    >
      {OPTIONS.map(({ value: option_value, label, description, icon: Icon }) => {
        const selected = value === option_value;
        return (
          <button
            key={option_value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`status_option status_option_${option_value} ${selected ? "selected" : ""}`}
            onClick={() => onChange(option_value)}
          >
            <span className="status_option_icon">
              <Icon size={20} strokeWidth={2.2} />
            </span>
            <span className="status_option_text">
              <span className="status_option_label">{label}</span>
              <span className="status_option_description">{description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default StatusSelector;
