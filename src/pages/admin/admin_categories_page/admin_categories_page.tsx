import { useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, Info, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import AdminTable from "../../../components/admin/admin_table/admin_table";
import type { AdminColumn } from "../../../components/admin/admin_table/admin_table";
import AdminSearch from "../../../components/admin/admin_search/admin_search";
import AdminPagination from "../../../components/admin/admin_pagination/admin_pagination";
import { AdminToolbar } from "../../../components/admin/admin_filters/admin_filters";
import AdminModal from "../../../components/admin/admin_modal/admin_modal";
import AdminConfirmModal from "../../../components/admin/admin_confirm_modal/admin_confirm_modal";
import { AdminErrorState, AdminLoadingState } from "../../../components/admin/admin_states/admin_states";
import EmptyState from "../../../components/empty_state/empty_state";
import { useAdminList } from "../../../hooks/use_admin_list";
import { useAdminSession } from "../../../hooks/use_admin_session";
import {
  create_admin_category,
  delete_admin_category,
  get_admin_categories,
  update_admin_category,
} from "../../../services/admin/admin_categories_service";
import { get_admin_error_message } from "../../../services/admin/admin_error";
import type { AdminCategory, AdminCategoryForm } from "../../../types/admin/admin_category";

const NO_FILTERS = {};

interface CategoryFormModalProps {
  category: AdminCategory | null;
  on_close: () => void;
  on_saved: () => void;
}

const CategoryFormModal = ({ category, on_close, on_saved }: CategoryFormModalProps) => {
  const { notify } = useAdminSession();
  const [form, set_form] = useState<AdminCategoryForm>({
    nombre: category?.nombre ?? "",
    descripcion: category?.descripcion ?? "",
  });
  const [name_error, set_name_error] = useState<string | null>(null);
  const [description_error, set_description_error] = useState<string | null>(null);
  const [server_error, set_server_error] = useState<string | null>(null);
  const [busy, set_busy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    // Mismas reglas que el backend (categorias.nombre y descripcion son NOT NULL)
    const nombre = form.nombre.trim();
    const descripcion = form.descripcion.trim();
    const nombre_invalido = nombre.length < 2 || nombre.length > 60;
    const descripcion_invalida = descripcion.length < 3 || descripcion.length > 255;
    set_name_error(nombre_invalido ? "El nombre debe tener entre 2 y 60 caracteres." : null);
    set_description_error(descripcion_invalida ? "La descripción debe tener entre 3 y 255 caracteres." : null);
    if (nombre_invalido || descripcion_invalida) return;

    set_busy(true);
    set_server_error(null);
    try {
      if (category) {
        await update_admin_category(category.id, form);
        notify(`Categoría "${nombre}" actualizada`);
      } else {
        await create_admin_category(form);
        notify(`Categoría "${nombre}" creada`);
      }
      on_saved();
    } catch (error) {
      set_server_error(get_admin_error_message(error, "No se pudo guardar la categoría."));
      set_busy(false);
    }
  };

  return (
    <AdminModal
      is_open
      busy={busy}
      title={category ? "Editar categoría" : "Nueva categoría"}
      description={category ? category.nombre : "Aparece al publicar y al filtrar objetos."}
      on_close={on_close}
      footer={
        <>
          <button type="button" className="btn btn_ghost" onClick={on_close} disabled={busy}>Cancelar</button>
          <button type="submit" form="admin_category_form" className="btn btn_primary" disabled={busy}>
            {busy && <span className="spinner_small" />}
            {category ? "Guardar cambios" : "Crear categoría"}
          </button>
        </>
      }
    >
      <form id="admin_category_form" className="admin_form" onSubmit={submit} noValidate>
        {server_error && (
          <div className="form_alert form_alert_error" role="alert">
            <AlertCircle size={18} />
            <span>{server_error}</span>
          </div>
        )}
        <label className="form_field">
          <span className="form_label">Nombre <span className="admin_required">*</span></span>
          <input className={`form_input ${name_error ? "input_error" : ""}`} value={form.nombre} maxLength={60}
            placeholder="Ej.: Llaves" aria-invalid={Boolean(name_error)}
            onChange={(event) => {
              set_form((current) => ({ ...current, nombre: event.target.value }));
              set_name_error(null);
            }} />
          {name_error && <span className="field_error">{name_error}</span>}
        </label>
        <label className="form_field">
          <span className="form_label">Descripción <span className="admin_required">*</span></span>
          <textarea className={`form_textarea ${description_error ? "input_error" : ""}`} rows={3} maxLength={255}
            value={form.descripcion} placeholder="Ej.: Llaves sueltas y llaveros" aria-invalid={Boolean(description_error)}
            onChange={(event) => {
              set_form((current) => ({ ...current, descripcion: event.target.value }));
              set_description_error(null);
            }} />
          {description_error ? (
            <span className="field_error">{description_error}</span>
          ) : (
            <span className="form_hint">{form.descripcion.length}/255</span>
          )}
        </label>
      </form>
    </AdminModal>
  );
};

const AdminCategoriesPage = () => {
  const { session, notify } = useAdminSession();
  const can_manage = session.permisos.categorias.gestionar;
  const list = useAdminList(get_admin_categories, NO_FILTERS);
  const [editing, set_editing] = useState<AdminCategory | null | undefined>(undefined);
  const [deleting, set_deleting] = useState<AdminCategory | null>(null);

  const confirm_delete = async () => {
    if (!deleting) return;
    await delete_admin_category(deleting.id);
    notify(`Categoría "${deleting.nombre}" eliminada`);
    set_deleting(null);
    list.reload();
  };

  const columns: AdminColumn<AdminCategory>[] = [
    {
      key: "nombre",
      header: "Categoría",
      render: (cat) => (
        <span className="admin_cell_main">
          <span className="admin_thumb"><Tags size={18} /></span>
          <span className="admin_cell_title">{cat.nombre}</span>
        </span>
      ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (cat) => <span className={cat.descripcion ? "" : "admin_muted"}>{cat.descripcion || "Sin descripción"}</span>,
    },
    { key: "activas", header: "Activas", align: "right", render: (cat) => <span className="admin_number">{cat.publicaciones_activas}</span> },
    { key: "total", header: "Total", align: "right", render: (cat) => <span className="admin_number">{cat.publicaciones_total}</span> },
  ];

  if (can_manage) {
    columns.push({
      key: "acciones",
      header: "Acciones",
      align: "right",
      width: "110px",
      render: (cat) => (
        <span className="admin_row_actions">
          <button className="icon_button" aria-label={`Editar ${cat.nombre}`} title="Editar" onClick={() => set_editing(cat)}>
            <Pencil size={17} />
          </button>
          <button className="icon_button is_danger" aria-label={`Eliminar ${cat.nombre}`}
            title={cat.publicaciones_total > 0 ? "Hay publicaciones con esta categoría: no se puede eliminar" : "Eliminar"}
            disabled={cat.publicaciones_total > 0} onClick={() => set_deleting(cat)}>
            <Trash2 size={17} />
          </button>
        </span>
      ),
    });
  }

  return (
    <div className="admin_page">
      {!can_manage && (
        <div className="admin_notice">
          <Info size={18} />
          <span>Solo lectura: las categorías son de toda la plataforma y las gestiona el administrador general. Los totales muestran solo publicaciones de tus instituciones.</span>
        </div>
      )}

      <AdminToolbar>
        <AdminSearch value={list.search} on_search={list.set_search} placeholder="Buscar categorías" />
        {can_manage && (
          <button className="btn btn_primary" onClick={() => set_editing(null)}>
            <Plus size={18} />
            Nueva categoría
          </button>
        )}
      </AdminToolbar>

      {list.error && !list.data ? (
        <AdminErrorState message={list.error} on_retry={list.reload} />
      ) : !list.data ? (
        <AdminLoadingState label="Cargando categorías..." />
      ) : list.data.items.length === 0 ? (
        <EmptyState icon={Tags}
          title={list.search ? "No encontramos categorías" : "Todavía no hay categorías"}
          description={list.search ? "Probá con otra búsqueda." : undefined} />
      ) : (
        <>
          {list.error && <div className="form_alert form_alert_error" role="alert">{list.error}</div>}
          <AdminTable caption="Categorías" columns={columns} rows={list.data.items} get_row_key={(cat) => cat.id}
            refreshing={list.loading} />
          <AdminPagination page={list.data.page} total_pages={list.data.total_pages} total={list.data.total}
            limit={list.data.limit} on_change={list.go_to_page} disabled={list.loading} />
        </>
      )}

      {editing !== undefined && (
        <CategoryFormModal category={editing} on_close={() => set_editing(undefined)}
          on_saved={() => {
            set_editing(undefined);
            list.reload();
          }} />
      )}

      {deleting && (
        <AdminConfirmModal
          is_open
          title="Eliminar categoría"
          description={`Vas a eliminar "${deleting.nombre}". Ninguna publicación la usa. Esta acción no se puede deshacer.`}
          confirm_label="Eliminar categoría"
          on_close={() => set_deleting(null)}
          on_confirm={confirm_delete}
        />
      )}
    </div>
  );
};

export default AdminCategoriesPage;
