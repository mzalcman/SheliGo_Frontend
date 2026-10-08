import { useState } from "react";
import { ChevronRight, ShieldCheck, Users } from "lucide-react";
import AdminTable from "../../../components/admin/admin_table/admin_table";
import type { AdminColumn } from "../../../components/admin/admin_table/admin_table";
import AdminSearch from "../../../components/admin/admin_search/admin_search";
import AdminPagination from "../../../components/admin/admin_pagination/admin_pagination";
import { AdminSelectFilter, AdminToolbar } from "../../../components/admin/admin_filters/admin_filters";
import { AdminRoleBadge } from "../../../components/admin/admin_badge/admin_badge";
import { ROLE_LABELS } from "../../../components/admin/admin_badge/admin_labels";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import EmptyState from "../../../components/empty_state/empty_state";
import { useAdminList } from "../../../hooks/use_admin_list";
import { useAdminInstitutionOptions } from "../../../hooks/use_admin_options";
import { get_admin_users } from "../../../services/admin/admin_users_service";
import { format_admin_date, full_name } from "../../../utils/admin_format";
import AdminUserDetailModal from "./admin_user_detail_modal";
import type { AdminUser, AdminUserFilters } from "../../../types/admin/admin_user";
import type { UserRole } from "../../../types/user";

const ROLE_OPTIONS = (Object.keys(ROLE_LABELS) as UserRole[]).map((rol) => ({ value: rol, label: ROLE_LABELS[rol] }));
const INITIAL_FILTERS: AdminUserFilters = {};

const InstitutionChips = ({ user }: { user: AdminUser }) => {
  if (user.instituciones.length === 0) return <span className="admin_muted">Sin institución</span>;
  const visible = user.instituciones.slice(0, 2);
  const rest = user.instituciones.length - visible.length;
  return (
    <span className="admin_chips">
      {visible.map((inst) => (
        <span key={inst.id} className="admin_chip" title={inst.es_admin ? `Administra ${inst.nombre}` : inst.nombre}>
          {inst.es_admin && <ShieldCheck size={12} />}
          {inst.nombre}
        </span>
      ))}
      {rest > 0 && <span className="admin_chip">+{rest}</span>}
    </span>
  );
};

const AdminUsersPage = () => {
  const list = useAdminList(get_admin_users, INITIAL_FILTERS);
  const institution_options = useAdminInstitutionOptions();
  const [selected_id, set_selected_id] = useState<string | null>(null);

  const columns: AdminColumn<AdminUser>[] = [
    {
      key: "usuario",
      header: "Usuario",
      render: (user) => (
        <span className="admin_cell_main">
          <img src={user.foto || "/user_predeterminada.png"} alt="" className="admin_avatar" loading="lazy"
            onError={(event) => { event.currentTarget.src = "/user_predeterminada.png"; }} />
          <span className="admin_cell_text">
            <span className="admin_cell_title">{full_name(user.nombre, user.apellido) || "Sin nombre"}</span>
            <span className="admin_cell_sub">{user.email}</span>
          </span>
        </span>
      ),
    },
    { key: "rol", header: "Rol", render: (user) => <AdminRoleBadge rol={user.rol} /> },
    { key: "instituciones", header: "Instituciones", render: (user) => <InstitutionChips user={user} /> },
    {
      key: "publicaciones",
      header: "Publicaciones",
      align: "right",
      render: (user) => <span className="admin_number">{user.publicaciones_count}</span>,
    },
    { key: "alta", header: "Alta", render: (user) => <span className="admin_muted">{format_admin_date(user.created_at)}</span> },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      width: "72px",
      hide_on_mobile: true,
      render: (user) => (
        <span className="admin_row_actions">
          <button className="icon_button" aria-label={`Ver ${user.email}`}
            onClick={(event) => { event.stopPropagation(); set_selected_id(user.id); }}>
            <ChevronRight size={18} />
          </button>
        </span>
      ),
    },
  ];

  const has_filters = Boolean(list.search || list.filters.rol || list.filters.institucion_id);

  return (
    <div className="admin_page">
      <AdminToolbar>
        <AdminSearch value={list.search} on_search={list.set_search} placeholder="Buscar por nombre o email" />
        <AdminSelectFilter label="Rol" value={list.filters.rol ?? ""} options={ROLE_OPTIONS}
          on_change={(value) => list.set_filter("rol", (value || undefined) as UserRole | undefined)} />
        {institution_options.length > 1 && (
          <AdminSelectFilter label="Institución" all_label="Todas" value={list.filters.institucion_id ?? ""}
            options={institution_options.map((i) => ({ value: i.id, label: i.nombre }))}
            on_change={(value) => list.set_filter("institucion_id", value || undefined)} />
        )}
      </AdminToolbar>

      {list.error && !list.data ? (
        <AdminErrorState message={list.error} on_retry={list.reload} />
      ) : !list.data ? (
        <AdminLoadingState label="Cargando usuarios..." />
      ) : list.data.items.length === 0 ? (
        <EmptyState icon={Users}
          title={has_filters ? "No encontramos usuarios" : "Todavía no hay usuarios"}
          description={has_filters ? "Probá con otra búsqueda o quitá los filtros." : undefined} />
      ) : (
        <>
          {list.error && <div className="form_alert form_alert_error" role="alert">{list.error}</div>}
          <AdminTable caption="Usuarios" columns={columns} rows={list.data.items} get_row_key={(user) => user.id}
            on_row_click={(user) => set_selected_id(user.id)} refreshing={list.loading} />
          <AdminPagination page={list.data.page} total_pages={list.data.total_pages} total={list.data.total}
            limit={list.data.limit} on_change={list.go_to_page} disabled={list.loading} />
        </>
      )}

      <AdminUserDetailModal user_id={selected_id} on_close={() => set_selected_id(null)} on_changed={list.reload} />
    </div>
  );
};

export default AdminUsersPage;
