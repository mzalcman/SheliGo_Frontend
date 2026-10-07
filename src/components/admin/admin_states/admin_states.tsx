import { AlertTriangle, RotateCw } from "lucide-react";
import "./admin_states.css";

// Carga inicial de una sección (cuando todavía no hay datos para mostrar)
export const AdminLoadingState = ({ label = "Cargando..." }: { label?: string }) => (
  <div className="admin_state" role="status">
    <div className="spinner" />
    <p className="admin_state_text">{label}</p>
  </div>
);

// Error de carga con opción de reintentar
export const AdminErrorState = ({ message, on_retry }: { message: string; on_retry?: () => void }) => (
  <div className="admin_state admin_state_error" role="alert">
    <div className="admin_state_icon">
      <AlertTriangle size={24} />
    </div>
    <p className="admin_state_title">No pudimos cargar la información</p>
    <p className="admin_state_text">{message}</p>
    {on_retry && (
      <button className="btn btn_secondary btn_sm" onClick={on_retry}>
        <RotateCw size={16} />
        Reintentar
      </button>
    )}
  </div>
);
