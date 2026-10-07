import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import "./admin_search.css";

interface AdminSearchProps {
  value: string;
  on_search: (value: string) => void;
  placeholder: string;
  delay?: number;
}

/* Buscador con espera (debounce): la API recibe una sola consulta
   cuando la persona deja de escribir, no una por tecla. */
const AdminSearch = ({ value, on_search, placeholder, delay = 400 }: AdminSearchProps) => {
  const [text, set_text] = useState(value);
  const last_sent = useRef(value);

  useEffect(() => {
    const trimmed = text.trim();
    if (trimmed === last_sent.current) return;
    const timer = window.setTimeout(() => {
      last_sent.current = trimmed;
      on_search(trimmed);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [text, delay, on_search]);

  const clear = () => {
    set_text("");
    last_sent.current = "";
    on_search("");
  };

  return (
    <div className="admin_search">
      <Search size={18} className="admin_search_icon" aria-hidden="true" />
      <input
        type="search"
        className="form_input admin_search_input"
        placeholder={placeholder}
        value={text}
        onChange={(event) => set_text(event.target.value)}
        aria-label={placeholder}
        maxLength={100}
      />
      {text && (
        <button type="button" className="admin_search_clear" onClick={clear} aria-label="Limpiar búsqueda">
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AdminSearch;
