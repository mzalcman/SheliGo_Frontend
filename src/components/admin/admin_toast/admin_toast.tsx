import { CheckCircle2, AlertCircle, X } from "lucide-react";
import "./admin_toast.css";

export type AdminToastTone = "success" | "error";

export interface AdminToastItem {
  id: number;
  message: string;
  tone: AdminToastTone;
}

interface AdminToastProps {
  toasts: AdminToastItem[];
  on_dismiss: (id: number) => void;
}

const AdminToast = ({ toasts, on_dismiss }: AdminToastProps) => (
  <div className="admin_toast_region" role="status" aria-live="polite">
    {toasts.map((toast) => (
      <div key={toast.id} className={`admin_toast admin_toast_${toast.tone}`}>
        {toast.tone === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{toast.message}</span>
        <button onClick={() => on_dismiss(toast.id)} aria-label="Cerrar aviso">
          <X size={16} />
        </button>
      </div>
    ))}
  </div>
);

export default AdminToast;
