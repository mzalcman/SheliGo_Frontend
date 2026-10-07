import { useState } from "react";
import AdminConfirmModal from "../../../components/admin/admin_confirm_modal/admin_confirm_modal";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { useAdminInstitutionOptions } from "../../../hooks/use_admin_options";
import { update_admin_user_institutions } from "../../../services/admin/admin_users_service";
import { full_name } from "../../../utils/admin_format";
import AdminInstitutionChecklist from "./admin_institution_checklist";
import type { AdminUserDetail } from "../../../types/admin/admin_user";

interface AdminUserInstitutionsModalProps {
  user: AdminUserDetail;
  on_close: () => void;
  on_saved: (user: AdminUserDetail) => void;
}

// Membresías del usuario (solo admin general). El rol de administrador se conserva donde ya lo tenía.
const AdminUserInstitutionsModal = ({ user, on_close, on_saved }: AdminUserInstitutionsModalProps) => {
  const { notify } = useAdminSession();
  const institution_options = useAdminInstitutionOptions();
  const [selected, set_selected] = useState<string[]>(user.instituciones.map((inst) => inst.id));
  const name = full_name(user.nombre, user.apellido) || user.email;

  const save = async () => {
    const updated = await update_admin_user_institutions(user.id, selected);
    notify(`Instituciones de ${name} actualizadas`);
    on_saved(updated);
  };

  return (
    <AdminConfirmModal
      is_open
      tone="primary"
      title="Editar instituciones"
      description={`Definí a qué instituciones pertenece ${name}. Va a ver las publicaciones de esas instituciones en la app.`}
      confirm_label="Guardar instituciones"
      confirm_disabled={selected.length === 0}
      on_close={on_close}
      on_confirm={save}
    >
      <AdminInstitutionChecklist label="Instituciones" options={institution_options} selected={selected}
        on_change={set_selected} />
      {selected.length === 0 && <span className="field_error">Tiene que pertenecer al menos a una institución.</span>}
    </AdminConfirmModal>
  );
};

export default AdminUserInstitutionsModal;
