import { Building2, MapPin, Pencil } from "lucide-react";
import AdminModal from "../../../components/admin/admin_modal/admin_modal";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { get_admin_institution } from "../../../services/admin/admin_institutions_service";
import { useAdminDetail } from "../../../hooks/use_admin_detail";
import { format_admin_date, full_name } from "../../../utils/admin_format";
import type { AdminInstitution } from "../../../types/admin/admin_institution";

interface AdminInstitutionDetailModalProps {
  institution_id: string | null;
  on_close: () => void;
  on_edit: (institution: AdminInstitution) => void;
}

const AdminInstitutionDetailModal = ({ institution_id, on_close, on_edit }: AdminInstitutionDetailModalProps) => {
  const { session } = useAdminSession();
  const { state, reload } = useAdminDetail(get_admin_institution, institution_id);

  const inst = state.status === "ready" ? state.data : null;
  const has_location = inst?.latitud != null && inst?.longitud != null;

  return (
    <AdminModal is_open={Boolean(institution_id)} title="Detalle de la institución" on_close={on_close} size="lg">
      {state.status === "loading" && <AdminLoadingState />}
      {state.status === "error" && (
        <AdminErrorState message={state.message} on_retry={reload} />
      )}
      {inst && (
        <>
          <div className="admin_detail_profile">
            <span className="admin_thumb">
              {inst.foto ? <img src={inst.foto} alt="" /> : <Building2 size={24} />}
            </span>
            <div className="admin_cell_text">
              <span className="admin_cell_title" style={{ whiteSpace: "normal" }}>{inst.nombre}</span>
              <span className="admin_cell_sub">Alta: {format_admin_date(inst.created_at)}</span>
            </div>
          </div>

          <section className="admin_detail_section">
            <dl className="admin_detail_list">
              <div><dt>Email</dt><dd>{inst.email || "—"}</dd></div>
              <div><dt>Teléfono</dt><dd>{inst.telefono || "—"}</dd></div>
              <div className="is_wide"><dt>Dirección</dt><dd>{inst.direccion || "—"}</dd></div>
              <div><dt>Miembros</dt><dd>{inst.miembros_count}</dd></div>
              <div>
                <dt>Publicaciones</dt>
                <dd>
                  {inst.publicaciones_activas} activas · {inst.publicaciones_recuperadas} recuperadas · {inst.publicaciones_total} en total
                </dd>
              </div>
            </dl>
            <div className="admin_detail_actions">
              {session.permisos.instituciones.editar && (
                <button className="btn btn_secondary btn_sm" onClick={() => on_edit({ ...inst, admins_count: inst.administradores.length })}>
                  <Pencil size={16} />
                  Editar datos
                </button>
              )}
              {has_location && (
                <a className="btn btn_ghost btn_sm" target="_blank" rel="noreferrer"
                  href={`https://www.google.com/maps?q=${inst.latitud},${inst.longitud}`}>
                  <MapPin size={16} />
                  Ver en el mapa
                </a>
              )}
            </div>
          </section>

          <section className="admin_detail_section">
            <h3 className="admin_detail_heading">Administradores institucionales</h3>
            {inst.administradores.length === 0 ? (
              <p className="admin_muted">
                No tiene administradores asignados.
                {session.permisos.usuarios.cambiar_rol && " Se asignan desde Usuarios → Cambiar rol."}
              </p>
            ) : (
              <div className="admin_list">
                {inst.administradores.map((admin) => (
                  <div key={admin.id} className="admin_list_item">
                    <span className="admin_cell_title">{full_name(admin.nombre, admin.apellido)}</span>
                    <span className="admin_muted">{admin.email}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminModal>
  );
};

export default AdminInstitutionDetailModal;
