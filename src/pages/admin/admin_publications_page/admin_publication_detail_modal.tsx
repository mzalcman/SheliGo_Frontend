import { useState } from "react";
import { CheckCircle2, ExternalLink, RotateCcw, Trash2, Undo2 } from "lucide-react";
import AdminModal from "../../../components/admin/admin_modal/admin_modal";
import AdminConfirmModal from "../../../components/admin/admin_confirm_modal/admin_confirm_modal";
import { AdminBadge, AdminStateBadge, AdminTypeBadge } from "../../../components/admin/admin_badge/admin_badge";
import { STATE_LABELS } from "../../../components/admin/admin_badge/admin_labels";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { change_admin_publication_state, get_admin_publication } from "../../../services/admin/admin_publications_service";
import { useAdminDetail } from "../../../hooks/use_admin_detail";
import { format_admin_date_time, full_name } from "../../../utils/admin_format";
import type { AdminPublicationState } from "../../../types/admin/admin_publication";

interface AdminPublicationDetailModalProps {
  publication_id: string | null;
  on_close: () => void;
  on_changed: () => void;
}

// Textos de cada acción de moderación
const ACTIONS: Record<AdminPublicationState, { title: string; confirm: string; description: string; done: string }> = {
  eliminada: {
    title: "Eliminar publicación",
    confirm: "Eliminar",
    description: "Deja de verse en SheliGo. Es una baja lógica: sus fotos y preguntas se conservan y se puede restaurar.",
    done: "Publicación eliminada",
  },
  activa: {
    title: "Marcar como activa",
    confirm: "Marcar como activa",
    description: "Vuelve a mostrarse en la app como un objeto que todavía se está buscando.",
    done: "Publicación activa",
  },
  recuperada: {
    title: "Marcar como recuperada",
    confirm: "Marcar como recuperada",
    description: "Indica que el objeto ya volvió a su dueño.",
    done: "Publicación marcada como recuperada",
  },
};

const AdminPublicationDetailModal = ({ publication_id, on_close, on_changed }: AdminPublicationDetailModalProps) => {
  const { notify } = useAdminSession();
  const { state, reload, set_data } = useAdminDetail(get_admin_publication, publication_id);
  const [target_state, set_target_state] = useState<AdminPublicationState | null>(null);
  const [reason, set_reason] = useState("");

  const publication = state.status === "ready" ? state.data : null;

  const open_action = (estado: AdminPublicationState) => {
    set_reason("");
    set_target_state(estado);
  };

  const confirm_action = async () => {
    if (!publication || !target_state) return;
    const was_deleted = publication.estado === "eliminada";
    const updated = await change_admin_publication_state(publication.id, target_state, reason);
    set_data(updated);
    notify(was_deleted ? "Publicación restaurada" : ACTIONS[target_state].done);
    set_target_state(null);
    on_changed();
  };

  const action = target_state ? ACTIONS[target_state] : null;
  const is_restore = publication?.estado === "eliminada";

  return (
    <>
      <AdminModal is_open={Boolean(publication_id)} title="Detalle de la publicación" on_close={on_close} size="lg">
        {state.status === "loading" && <AdminLoadingState />}
        {state.status === "error" && (
          <AdminErrorState message={state.message} on_retry={reload} />
        )}
        {publication && (
          <>
            <div className="admin_detail_profile">
              <div className="admin_cell_text">
                <span className="admin_cell_title" style={{ whiteSpace: "normal" }}>{publication.nombre}</span>
                <span className="admin_detail_actions" style={{ marginTop: 6 }}>
                  <AdminTypeBadge tipo={publication.tipo} />
                  <AdminStateBadge estado={publication.estado} />
                </span>
              </div>
            </div>

            {publication.archivos.length > 0 && (
              <section className="admin_detail_section">
                <div className="admin_gallery">
                  {publication.archivos.map((archivo) => (
                    <a key={archivo.id} href={archivo.url} target="_blank" rel="noreferrer">
                      <img src={archivo.url} alt="" loading="lazy" />
                      {archivo.es_principal && (
                        <span className="admin_gallery_main"><AdminBadge tone="dark">Principal</AdminBadge></span>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="admin_detail_section">
              <dl className="admin_detail_list">
                <div className="is_wide"><dt>Descripción</dt><dd>{publication.descripcion || "Sin descripción"}</dd></div>
                <div><dt>Categoría</dt><dd>{publication.categoria_nombre ?? "—"}</dd></div>
                <div><dt>Institución</dt><dd>{publication.institucion_nombre ?? "Sin institución"}</dd></div>
                <div><dt>Lugar</dt><dd>{publication.lugar_institucion || "—"}</dd></div>
                <div><dt>Fecha del evento</dt><dd>{format_admin_date_time(publication.fecha_evento)}</dd></div>
                <div>
                  <dt>Publicado por</dt>
                  <dd>{full_name(publication.usuario_nombre, publication.usuario_apellido)} · {publication.usuario_email}</dd>
                </div>
                <div><dt>Publicado</dt><dd>{format_admin_date_time(publication.created_at)}</dd></div>
                <div><dt>Preguntas</dt><dd>{publication.preguntas_count}</dd></div>
                <div><dt>Última modificación</dt><dd>{format_admin_date_time(publication.updated_at)}</dd></div>
              </dl>
            </section>

            <section className="admin_detail_section">
              <h3 className="admin_detail_heading">Moderación</h3>
              <div className="admin_detail_actions">
                {is_restore ? (
                  <button className="btn btn_primary btn_sm" onClick={() => open_action("activa")}>
                    <RotateCcw size={16} />
                    Restaurar
                  </button>
                ) : (
                  <>
                    {publication.estado === "activa" ? (
                      <button className="btn btn_secondary btn_sm" onClick={() => open_action("recuperada")}>
                        <CheckCircle2 size={16} />
                        Marcar como recuperada
                      </button>
                    ) : (
                      <button className="btn btn_secondary btn_sm" onClick={() => open_action("activa")}>
                        <Undo2 size={16} />
                        Volver a activa
                      </button>
                    )}
                    <button className="btn btn_danger btn_sm" onClick={() => open_action("eliminada")}>
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </>
                )}
                {publication.estado !== "eliminada" && (
                  <a className="btn btn_ghost btn_sm" href={`/publicacion/${publication.id}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={16} />
                    Ver en la app
                  </a>
                )}
              </div>
            </section>
          </>
        )}
      </AdminModal>

      {publication && action && target_state && (
        <AdminConfirmModal
          is_open
          tone={target_state === "eliminada" ? "danger" : "primary"}
          title={is_restore ? "Restaurar publicación" : action.title}
          description={
            is_restore
              ? `"${publication.nombre}" vuelve a mostrarse en SheliGo como ${STATE_LABELS.activa.toLowerCase()}.`
              : `"${publication.nombre}": ${action.description}`
          }
          confirm_label={is_restore ? "Restaurar" : action.confirm}
          on_close={() => set_target_state(null)}
          on_confirm={confirm_action}
        >
          <label className="form_field">
            <span className="form_label">Motivo (opcional)</span>
            <textarea className="form_textarea" rows={3} maxLength={500} value={reason}
              onChange={(event) => set_reason(event.target.value)}
              placeholder="Queda registrado en la auditoría" />
          </label>
        </AdminConfirmModal>
      )}
    </>
  );
};

export default AdminPublicationDetailModal;
