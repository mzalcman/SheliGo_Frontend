import { useState } from "react";
import AdminConfirmModal from "../../../components/admin/admin_confirm_modal/admin_confirm_modal";
import { ROLE_LABELS } from "../../../components/admin/admin_badge/admin_labels";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { useAdminInstitutionOptions } from "../../../hooks/use_admin_options";
import { change_admin_user_role } from "../../../services/admin/admin_users_service";
import { full_name } from "../../../utils/admin_format";
import AdminInstitutionChecklist from "./admin_institution_checklist";
import type { AdminUserDetail } from "../../../types/admin/admin_user";
import type { UserRole } from "../../../types/user";

const ROLE_HELP: Record<UserRole, string> = {
  user: "Usa SheliGo normalmente, sin acceso al backoffice.",
  institution_admin: "Modera publicaciones y edita los datos de las instituciones que se le asignen.",
  admin: "Acceso total: usuarios, roles, instituciones y categorías de toda la plataforma.",
};

interface AdminUserRoleModalProps {
  user: AdminUserDetail;
  on_close: () => void;
  on_saved: (user: AdminUserDetail) => void;
}

// Solo lo ve el admin general; el backend igual rechaza cualquier otro rol (403)
const AdminUserRoleModal = ({ user, on_close, on_saved }: AdminUserRoleModalProps) => {
  const { notify } = useAdminSession();
  const institution_options = useAdminInstitutionOptions();
  const [rol, set_rol] = useState<UserRole>(user.rol);
  const [institution_ids, set_institution_ids] = useState<string[]>(
    user.instituciones.filter((inst) => inst.es_admin).map((inst) => inst.id)
  );

  const needs_institutions = rol === "institution_admin";
  const invalid = needs_institutions && institution_ids.length === 0;
  const name = full_name(user.nombre, user.apellido) || user.email;

  const save = async () => {
    const updated = await change_admin_user_role(user.id, rol, institution_ids);
    notify(`Rol de ${name} actualizado a ${ROLE_LABELS[rol]}`);
    on_saved(updated);
  };

  return (
    <AdminConfirmModal
      is_open
      tone="primary"
      title="Cambiar rol"
      description={`Elegí el nuevo rol de ${name}. El cambio aplica de inmediato y queda registrado en la auditoría.`}
      confirm_label="Confirmar cambio"
      confirm_disabled={invalid}
      on_close={on_close}
      on_confirm={save}
    >
      <div className="admin_form">
        <div className="admin_role_options" role="radiogroup" aria-label="Rol">
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((option) => (
            <label key={option} className={`admin_role_option ${rol === option ? "is_selected" : ""}`}>
              <input type="radio" name="rol" value={option} checked={rol === option} onChange={() => set_rol(option)} />
              <span>
                <strong>{ROLE_LABELS[option]}</strong>
                <span className="admin_cell_sub">{ROLE_HELP[option]}</span>
              </span>
            </label>
          ))}
        </div>

        {needs_institutions && (
          <AdminInstitutionChecklist label="Instituciones que va a administrar" options={institution_options}
            selected={institution_ids} on_change={set_institution_ids} />
        )}
        {invalid && <span className="field_error">Elegí al menos una institución.</span>}
      </div>
    </AdminConfirmModal>
  );
};

export default AdminUserRoleModal;
