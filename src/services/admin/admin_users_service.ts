import { api } from "../api";
import { clean_params } from "./admin_params";
import type { AdminListParams, AdminPaginated } from "../../types/admin/admin_pagination";
import type { AdminUser, AdminUserDetail, AdminUserFilters } from "../../types/admin/admin_user";
import type { UserRole } from "../../types/user";

export const get_admin_users = async (
  params: AdminListParams & AdminUserFilters,
  signal?: AbortSignal
): Promise<AdminPaginated<AdminUser>> => {
  const response = await api.get("/admin/usuarios", { params: clean_params(params), signal });
  return response.data.data;
};

export const get_admin_user = async (id: string): Promise<AdminUserDetail> => {
  const response = await api.get(`/admin/usuarios/${id}`);
  return response.data.data.usuario;
};

export const change_admin_user_role = async (
  id: string,
  rol: UserRole,
  instituciones_ids: string[]
): Promise<AdminUserDetail> => {
  const body = rol === "institution_admin" ? { rol, instituciones_ids } : { rol };
  const response = await api.patch(`/admin/usuarios/${id}/rol`, body);
  return response.data.data.usuario;
};

export const update_admin_user_institutions = async (
  id: string,
  instituciones_ids: string[]
): Promise<AdminUserDetail> => {
  const response = await api.put(`/admin/usuarios/${id}/instituciones`, { instituciones_ids });
  return response.data.data.usuario;
};
