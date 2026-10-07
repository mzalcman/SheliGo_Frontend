import { api } from "../api";
import { clean_params } from "./admin_params";
import type { AdminListParams, AdminPaginated } from "../../types/admin/admin_pagination";
import type { AdminCategory, AdminCategoryForm } from "../../types/admin/admin_category";

export const get_admin_categories = async (
  params: AdminListParams,
  signal?: AbortSignal
): Promise<AdminPaginated<AdminCategory>> => {
  const response = await api.get("/admin/categorias", { params: clean_params(params), signal });
  return response.data.data;
};

const to_body = (form: AdminCategoryForm) => ({
  nombre: form.nombre.trim(),
  descripcion: form.descripcion.trim(),
});

export const create_admin_category = async (form: AdminCategoryForm): Promise<AdminCategory> => {
  const response = await api.post("/admin/categorias", to_body(form));
  return response.data.data.categoria;
};

export const update_admin_category = async (id: string, form: AdminCategoryForm): Promise<AdminCategory> => {
  const response = await api.patch(`/admin/categorias/${id}`, to_body(form));
  return response.data.data.categoria;
};

export const delete_admin_category = async (id: string): Promise<void> => {
  await api.delete(`/admin/categorias/${id}`);
};
