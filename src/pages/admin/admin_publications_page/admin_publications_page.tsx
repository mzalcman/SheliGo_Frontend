import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, ImageOff, Package, X } from "lucide-react";
import AdminTable from "../../../components/admin/admin_table/admin_table";
import type { AdminColumn } from "../../../components/admin/admin_table/admin_table";
import AdminSearch from "../../../components/admin/admin_search/admin_search";
import AdminPagination from "../../../components/admin/admin_pagination/admin_pagination";
import { AdminSelectFilter, AdminToolbar } from "../../../components/admin/admin_filters/admin_filters";
import { AdminStateBadge, AdminTypeBadge } from "../../../components/admin/admin_badge/admin_badge";
import { STATE_LABELS } from "../../../components/admin/admin_badge/admin_labels";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import EmptyState from "../../../components/empty_state/empty_state";
import { useAdminList } from "../../../hooks/use_admin_list";
import { useAdminCategoryOptions, useAdminInstitutionOptions } from "../../../hooks/use_admin_options";
import { get_admin_publications } from "../../../services/admin/admin_publications_service";
import { format_admin_date, full_name } from "../../../utils/admin_format";
import AdminPublicationDetailModal from "./admin_publication_detail_modal";
import type {
  AdminPublication,
  AdminPublicationFilters,
  AdminPublicationState,
  AdminPublicationType,
} from "../../../types/admin/admin_publication";

const STATE_OPTIONS = (Object.keys(STATE_LABELS) as AdminPublicationState[]).map((estado) => ({
  value: estado,
  label: STATE_LABELS[estado],
}));
const TYPE_OPTIONS = [
  { value: "perdido", label: "Perdido" },
  { value: "encontrado", label: "Encontrado" },
];

const AdminPublicationsPage = () => {
  const [search_params, set_search_params] = useSearchParams();
  // ?usuario_id= llega desde el detalle de un usuario; ?ver= abre una publicación puntual
  // (los filtros iniciales se leen una sola vez, al entrar a la página)
  const [initial_filters] = useState<AdminPublicationFilters>(() => ({
    usuario_id: search_params.get("usuario_id") ?? undefined,
  }));
  const list = useAdminList(get_admin_publications, initial_filters);
  const institution_options = useAdminInstitutionOptions();
  const category_options = useAdminCategoryOptions();
  const [selected_id, set_selected_id] = useState<string | null>(null);
  // Un click en la tabla tiene prioridad sobre ?ver= (link desde el dashboard o un usuario)
  const open_id = selected_id ?? search_params.get("ver");

  const close_detail = () => {
    set_selected_id(null);
    if (search_params.has("ver")) {
      search_params.delete("ver");
      set_search_params(search_params, { replace: true });
    }
  };

  const clear_user_filter = () => {
    list.set_filter("usuario_id", undefined);
    search_params.delete("usuario_id");
    set_search_params(search_params, { replace: true });
  };

  const columns: AdminColumn<AdminPublication>[] = [
    {
      key: "publicacion",
      header: "Publicación",
      render: (pub) => (
        <span className="admin_cell_main">
          <span className="admin_thumb">
            {pub.foto_principal_url ? <img src={pub.foto_principal_url} alt="" loading="lazy" /> : <ImageOff size={18} />}
          </span>
          <span className="admin_cell_text">
            <span className="admin_cell_title">{pub.nombre}</span>
            <span className="admin_cell_sub">{pub.categoria_nombre ?? "Sin categoría"}</span>
          </span>
        </span>
      ),
    },
    { key: "tipo", header: "Tipo", render: (pub) => <AdminTypeBadge tipo={pub.tipo} /> },
    { key: "estado", header: "Estado", render: (pub) => <AdminStateBadge estado={pub.estado} /> },
    {
      key: "institucion",
      header: "Institución",
      render: (pub) => <span className={pub.institucion_nombre ? "" : "admin_muted"}>{pub.institucion_nombre ?? "Sin institución"}</span>,
    },
    {
      key: "autor",
      header: "Publicado por",
      render: (pub) => (
        <span className="admin_cell_text">
          <span>{full_name(pub.usuario_nombre, pub.usuario_apellido)}</span>
          <span className="admin_cell_sub">{pub.usuario_email}</span>
        </span>
      ),
    },
    { key: "fecha", header: "Fecha", render: (pub) => <span className="admin_muted">{format_admin_date(pub.created_at)}</span> },
    {
      key: "acciones",
      header: "Acciones",
      align: "right",
      width: "72px",
      hide_on_mobile: true,
      render: (pub) => (
        <span className="admin_row_actions">
          <button className="icon_button" aria-label={`Ver ${pub.nombre}`}
            onClick={(event) => { event.stopPropagation(); set_selected_id(pub.id); }}>
            <ChevronRight size={18} />
          </button>
        </span>
      ),
    },
  ];

  const { filters } = list;
  const has_filters = Boolean(
    list.search || filters.estado || filters.tipo || filters.institucion_id || filters.categoria_id || filters.usuario_id
  );

  return (
    <div className="admin_page">
      <AdminToolbar>
        <AdminSearch value={list.search} on_search={list.set_search} placeholder="Buscar por nombre, descripción o email" />
        <AdminSelectFilter label="Estado" value={filters.estado ?? ""} options={STATE_OPTIONS}
          on_change={(value) => list.set_filter("estado", (value || undefined) as AdminPublicationState | undefined)} />
        <AdminSelectFilter label="Tipo" value={filters.tipo ?? ""} options={TYPE_OPTIONS}
          on_change={(value) => list.set_filter("tipo", (value || undefined) as AdminPublicationType | undefined)} />
        {institution_options.length > 1 && (
          <AdminSelectFilter label="Institución" all_label="Todas" value={filters.institucion_id ?? ""}
            options={institution_options.map((i) => ({ value: i.id, label: i.nombre }))}
            on_change={(value) => list.set_filter("institucion_id", value || undefined)} />
        )}
        <AdminSelectFilter label="Categoría" all_label="Todas" value={filters.categoria_id ?? ""}
          options={category_options.map((c) => ({ value: c.id, label: c.nombre }))}
          on_change={(value) => list.set_filter("categoria_id", value || undefined)} />
      </AdminToolbar>

      {filters.usuario_id && (
        <div>
          <span className="admin_active_filter">
            Publicaciones de un usuario
            <button onClick={clear_user_filter} aria-label="Quitar filtro de usuario"><X size={14} /></button>
          </span>
        </div>
      )}

      {list.error && !list.data ? (
        <AdminErrorState message={list.error} on_retry={list.reload} />
      ) : !list.data ? (
        <AdminLoadingState label="Cargando publicaciones..." />
      ) : list.data.items.length === 0 ? (
        <EmptyState icon={Package}
          title={has_filters ? "No encontramos publicaciones" : "Todavía no hay publicaciones"}
          description={has_filters ? "Probá con otra búsqueda o quitá los filtros." : undefined} />
      ) : (
        <>
          {list.error && <div className="form_alert form_alert_error" role="alert">{list.error}</div>}
          <AdminTable caption="Publicaciones" columns={columns} rows={list.data.items} get_row_key={(pub) => pub.id}
            on_row_click={(pub) => set_selected_id(pub.id)} refreshing={list.loading} />
          <AdminPagination page={list.data.page} total_pages={list.data.total_pages} total={list.data.total}
            limit={list.data.limit} on_change={list.go_to_page} disabled={list.loading} />
        </>
      )}

      <AdminPublicationDetailModal publication_id={open_id} on_close={close_detail} on_changed={list.reload} />
    </div>
  );
};

export default AdminPublicationsPage;
