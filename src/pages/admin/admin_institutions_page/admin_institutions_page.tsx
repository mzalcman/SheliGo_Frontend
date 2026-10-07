import { useState } from "react";
import { Building2, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import AdminTable from "../../../components/admin/admin_table/admin_table";
import type { AdminColumn } from "../../../components/admin/admin_table/admin_table";
import AdminSearch from "../../../components/admin/admin_search/admin_search";
import AdminPagination from "../../../components/admin/admin_pagination/admin_pagination";
import { AdminToolbar } from "../../../components/admin/admin_filters/admin_filters";
import AdminConfirmModal from "../../../components/admin/admin_confirm_modal/admin_confirm_modal";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import EmptyState from "../../../components/empty_state/empty_state";
import { useAdminList } from "../../../hooks/use_admin_list";
import { useAdminSession } from "../../../hooks/use_admin_session";
import { delete_admin_institution, get_admin_institutions } from "../../../services/admin/admin_institutions_service";
import AdminInstitutionFormModal from "./admin_institution_form_modal";
import AdminInstitutionDetailModal from "./admin_institution_detail_modal";
import type { AdminInstitution } from "../../../types/admin/admin_institution";

const NO_FILTERS = {};

const AdminInstitutionsPage = () => {
  const { session, notify } = useAdminSession();
  const { permisos } = session;
  const list = useAdminList(get_admin_institutions, NO_FILTERS);
  // undefined = cerrado, null = alta, objeto = edición
  const [editing, set_editing] = useState<AdminInstitution | null | undefined>(undefined);
  const [deleting, set_deleting] = useState<AdminInstitution | null>(null);
  const [detail_id, set_detail_id] = useState<string | null>(null);

  const has_dependencies = (inst: AdminInstitution) => inst.publicaciones_total > 0 || inst.miembros_count > 0;

  const confirm_delete = async () => {
    if (!deleting) return;
    await delete_admin_institution(deleting.id);
    notify(`Institución "${deleting.nombre}" eliminada`);
    set_deleting(null);
    list.reload();
  };

  const columns: AdminColumn<AdminInstitution>[] = [
    {
      key: "institucion",
      header: "Institución",
      render: (inst) => (
        <span className="admin_cell_main">
          <span className="admin_thumb">
            {inst.foto ? <img src={inst.foto} alt="" loading="lazy" /> : <Building2 size={18} />}
          </span>
          <span className="admin_cell_text">
            <span className="admin_cell_title">{inst.nombre}</span>
            <span className="admin_cell_sub">{inst.direccion || "Sin dirección"}</span>
          </span>
        </span>
      ),
    },
    {
      key: "contacto",
      header: "Contacto",
      render: (inst) =>
        inst.email || inst.telefono ? (
          <span className="admin_cell_text">
            <span>{inst.email || "—"}</span>
            <span className="admin_cell_sub">{inst.telefono || ""}</span>
          </span>
        ) : (
          <span className="admin_muted">Sin datos</span>
        ),
    },
    { key: "miembros", header: "Miembros", align: "right", render: (inst) => <span className="admin_number">{inst.miembros_count}</span> },
    { key: "admins", header: "Admins", align: "right", render: (inst) => <span className="admin_number">{inst.admins_count}</span> },
    {
      key: "publicaciones",
      header: "Activas",
      align: "right",
      render: (inst) => <span className="admin_number">{inst.publicaciones_activas}</span>,
    },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      width: "140px",
      render: (inst) => (
        <span className="admin_row_actions" onClick={(event) => event.stopPropagation()}>
          {permisos.instituciones.editar && (
            <button className="icon_button" aria-label={`Editar ${inst.nombre}`} title="Editar"
              onClick={() => set_editing(inst)}>
              <Pencil size={17} />
            </button>
          )}
          {permisos.instituciones.eliminar && (
            <button className="icon_button is_danger" aria-label={`Eliminar ${inst.nombre}`}
              title={has_dependencies(inst) ? "Tiene miembros o publicaciones: no se puede eliminar" : "Eliminar"}
              disabled={has_dependencies(inst)} onClick={() => set_deleting(inst)}>
              <Trash2 size={17} />
            </button>
          )}
          <button className="icon_button" aria-label={`Ver ${inst.nombre}`} onClick={() => set_detail_id(inst.id)}>
            <ChevronRight size={18} />
          </button>
        </span>
      ),
    },
  ];

  return (
    <div className="admin_page">
      <AdminToolbar>
        <AdminSearch value={list.search} on_search={list.set_search} placeholder="Buscar por nombre, dirección o email" />
        {permisos.instituciones.crear && (
          <button className="btn btn_primary" onClick={() => set_editing(null)}>
            <Plus size={18} />
            Nueva institución
          </button>
        )}
      </AdminToolbar>

      {list.error && !list.data ? (
        <AdminErrorState message={list.error} on_retry={list.reload} />
      ) : !list.data ? (
        <AdminLoadingState label="Cargando instituciones..." />
      ) : list.data.items.length === 0 ? (
        <EmptyState icon={Building2}
          title={list.search ? "No encontramos instituciones" : "Todavía no hay instituciones"}
          description={list.search ? "Probá con otra búsqueda." : undefined}>
          {!list.search && permisos.instituciones.crear && (
            <button className="btn btn_primary btn_sm" onClick={() => set_editing(null)}>
              <Plus size={16} />
              Crear la primera
            </button>
          )}
        </EmptyState>
      ) : (
        <>
          {list.error && <div className="form_alert form_alert_error" role="alert">{list.error}</div>}
          <AdminTable caption="Instituciones" columns={columns} rows={list.data.items} get_row_key={(inst) => inst.id}
            on_row_click={(inst) => set_detail_id(inst.id)} refreshing={list.loading} />
          <AdminPagination page={list.data.page} total_pages={list.data.total_pages} total={list.data.total}
            limit={list.data.limit} on_change={list.go_to_page} disabled={list.loading} />
        </>
      )}

      {editing !== undefined && (
        <AdminInstitutionFormModal
          institution={editing}
          on_close={() => set_editing(undefined)}
          on_saved={() => {
            set_editing(undefined);
            list.reload();
          }}
        />
      )}

      <AdminInstitutionDetailModal
        institution_id={detail_id}
        on_close={() => set_detail_id(null)}
        on_edit={(inst) => {
          set_detail_id(null);
          set_editing(inst);
        }}
      />

      {deleting && (
        <AdminConfirmModal
          is_open
          title="Eliminar institución"
          description={`Vas a eliminar "${deleting.nombre}" de forma definitiva. No tiene miembros ni publicaciones asociadas. Esta acción no se puede deshacer.`}
          confirm_label="Eliminar institución"
          on_close={() => set_deleting(null)}
          on_confirm={confirm_delete}
        />
      )}
    </div>
  );
};

export default AdminInstitutionsPage;
