import { useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import AdminModal from "../admin_modal/admin_modal";
import { get_admin_error_message } from "../../../services/admin/admin_error";
import "./admin_confirm_modal.css";

interface AdminConfirmModalProps {
  is_open: boolean;
  title: string;
  description: string;
  confirm_label: string;
  tone?: "danger" | "primary";
  on_close: () => void;
  // Si la acción falla, el error se muestra dentro del modal y se puede reintentar
  on_confirm: () => Promise<void>;
  // Para formularios dentro del modal que todavía no son válidos
  confirm_disabled?: boolean;
  children?: ReactNode;
}

/* Confirmación obligatoria antes de toda acción destructiva o sensible:
   nada se elimina ni cambia de rol con un solo click. */
const AdminConfirmModal = ({
  is_open,
  title,
  description,
  confirm_label,
  tone = "danger",
  on_close,
  on_confirm,
  confirm_disabled = false,
  children,
}: AdminConfirmModalProps) => {
  const [busy, set_busy] = useState(false);
  const [error, set_error] = useState<string | null>(null);

  const close = () => {
    if (busy) return;
    set_error(null);
    on_close();
  };

  const confirm = async () => {
    set_busy(true);
    set_error(null);
    try {
      await on_confirm();
    } catch (err) {
      set_error(get_admin_error_message(err, "No se pudo completar la acción."));
    } finally {
      set_busy(false);
    }
  };

  return (
    <AdminModal
      is_open={is_open}
      title={title}
      on_close={close}
      busy={busy}
      footer={
        <>
          <button className="btn btn_ghost" onClick={close} disabled={busy}>
            Cancelar
          </button>
          <button className={`btn btn_${tone}`} onClick={confirm} disabled={busy || confirm_disabled}>
            {busy && <span className="spinner_small" />}
            {confirm_label}
          </button>
        </>
      }
    >
      <p className="admin_confirm_text">{description}</p>
      {children && <div className="admin_confirm_extra">{children}</div>}
      {error && (
        <div className="form_alert form_alert_error admin_confirm_error" role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
    </AdminModal>
  );
};

export default AdminConfirmModal;
