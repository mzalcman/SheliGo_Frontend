import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, ShieldCheck, UserCog } from "lucide-react";
import AdminModal from "../../../components/admin/admin_modal/admin_modal";
import { AdminRoleBadge, AdminStateBadge } from "../../../components/admin/admin_badge/admin_badge";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { get_admin_user } from "../../../services/admin/admin_users_service";
import { useAdminDetail } from "../../../hooks/use_admin_detail";
import { format_admin_date, format_admin_relative, full_name } from "../../../utils/admin_format";
import AdminUserRoleModal from "./admin_user_role_modal";
import AdminUserInstitutionsModal from "./admin_user_institutions_modal";
import type { AdminUserDetail } from "../../../types/admin/admin_user";

interface AdminUserDetailModalProps {
  user_id: string | null;
  on_close: () => void;
  // Avisa a la lista que hubo cambios para recargarla
  on_changed: () => void;
}

const AdminUserDetailModal = ({ user_id, on_close, on_changed }: AdminUserDetailModalProps) => {
  const navigate = useNavigate();
  const { session } = useAdminSession();
  const { state, reload, set_data } = useAdminDetail(get_admin_user, user_id);
  const [editing, set_editing] = useState<"rol" | "instituciones" | null>(null);

  const handle_updated = (user: AdminUserDetail) => {
    set_data(user);
    set_editing(null);
    on_changed();
  };

  const user = state.status === "ready" ? state.data : null;
  const is_self = user?.id === session.usuario.id;
  const { permisos } = session;

  return (
    <>
      <AdminModal is_open={Boolean(user_id)} title="Detalle del usuario" on_close={on_close} size="lg">
        {state.status === "loading" && <AdminLoadingState />}
        {state.status === "error" && (
          <AdminErrorState message={state.message} on_retry={reload} />
        )}
        {user && (
          <>
            <div className="admin_detail_profile">
              <img src={user.foto || "/user_predeterminada.png"} alt="" className="admin_avatar"
                onError={(event) => { event.currentTarget.src = "/user_predeterminada.png"; }} />
              <div className="admin_cell_text">
                <span className="admin_cell_title">{full_name(user.nombre, user.apellido) || "Sin nombre"}</span>
                <span className="admin_cell_sub">{user.email}</span>
                <span style={{ marginTop: 6 }}><AdminRoleBadge rol={user.rol} /></span>
              </div>
            </div>

            <section className="admin_detail_section">
              <dl className="admin_detail_list">
                <div><dt>Teléfono</dt><dd>{user.telefono || "—"}</dd></div>
                <div><dt>Alta</dt><dd>{format_admin_date(user.created_at)}</dd></div>
                <div>
                  <dt>Publicaciones</dt>
                  <dd>
                    {user.publicaciones_resumen.activas} activas · {user.publicaciones_resumen.recuperadas} recuperadas
                    · {user.publicaciones_resumen.eliminadas} eliminadas
                  </dd>
                </div>
                <div><dt>Última actualización</dt><dd>{format_admin_relative(user.updated_at)}</dd></div>
              </dl>

              {(permisos.usuarios.cambiar_rol || permisos.usuarios.gestionar_instituciones) && (
                <div className="admin_detail_actions">
                  {permisos.usuarios.cambiar_rol && (
                    <button className="btn btn_secondary btn_sm" onClick={() => set_editing("rol")} disabled={is_self}
                      title={is_self ? "No podés cambiar tu propio rol" : undefined}>
                      <UserCog size={16} />
                      Cambiar rol
                    </button>
                  )}
                  {permisos.usuarios.gestionar_instituciones && (
                    <button className="btn btn_ghost btn_sm" onClick={() => set_editing("instituciones")}>
                      <Building2 size={16} />
                      Editar instituciones
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="admin_detail_section">
              <h3 className="admin_detail_heading">
                {session.es_global ? "Instituciones" : "Membresías en tus instituciones"}
              </h3>
              {user.instituciones.length === 0 ? (
                <p className="admin_muted">No pertenece a ninguna institución.</p>
              ) : (
                <div className="admin_list">
                  {user.instituciones.map((inst) => (
                    <div key={inst.id} className="admin_list_item">
                      <span className="admin_cell_title">{inst.nombre}</span>
                      {inst.es_admin ? (
                        <span className="admin_chip"><ShieldCheck size={12} />Administra</span>
                      ) : (
                        <span className="admin_muted">Miembro desde {format_admin_date(inst.fecha_union)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin_detail_section">
              <div className="admin_card_header">
                <h3 className="admin_detail_heading" style={{ margin: 0 }}>Publicaciones recientes</h3>
                {user.publicaciones_recientes.length > 0 && (
                  <button className="btn btn_text"
                    onClick={() => navigate(`/admin/publicaciones?usuario_id=${user.id}`)}>
                    Ver todas
                  </button>
                )}
              </div>
              {user.publicaciones_recientes.length === 0 ? (
                <p className="admin_muted">No tiene publicaciones.</p>
              ) : (
                <div className="admin_list">
                  {user.publicaciones_recientes.map((pub) => (
                    <button key={pub.id} className="admin_list_item"
                      onClick={() => navigate(`/admin/publicaciones?ver=${pub.id}`)}>
                      <span className="admin_cell_text">
                        <span className="admin_cell_title">{pub.nombre}</span>
                        <span className="admin_cell_sub">
                          {pub.institucion_nombre ?? "Sin institución"} · {format_admin_relative(pub.created_at)}
                        </span>
                      </span>
                      <AdminStateBadge estado={pub.estado} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </AdminModal>

      {user && editing === "rol" && (
        <AdminUserRoleModal user={user} on_close={() => set_editing(null)} on_saved={handle_updated} />
      )}
      {user && editing === "instituciones" && (
        <AdminUserInstitutionsModal user={user} on_close={() => set_editing(null)} on_saved={handle_updated} />
      )}
    </>
  );
};

export default AdminUserDetailModal;
