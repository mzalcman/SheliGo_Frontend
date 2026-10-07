import { api } from "../api";
import { clean_params } from "./admin_params";
import type { AdminListParams, AdminPaginated } from "../../types/admin/admin_pagination";
import type {
  AdminPublication,
  AdminPublicationDetail,
  AdminPublicationFilters,
  AdminPublicationState,
} from "../../types/admin/admin_publication";

export const get_admin_publications = async (
  params: AdminListParams & AdminPublicationFilters,
  signal?: AbortSignal
): Promise<AdminPaginated<AdminPublication>> => {
  const response = await api.get("/admin/publicaciones", { params: clean_params(params), signal });
  return response.data.data;
};

export const get_admin_publication = async (id: string): Promise<AdminPublicationDetail> => {
  const response = await api.get(`/admin/publicaciones/${id}`);
  return response.data.data.publicacion;
};

// Cambia estado, elimina (baja lógica) o restaura. El motivo queda en la auditoría.
export const change_admin_publication_state = async (
  id: string,
  estado: AdminPublicationState,
  motivo?: string
): Promise<AdminPublicationDetail> => {
  const response = await api.patch(`/admin/publicaciones/${id}/estado`, {
    estado,
    ...(motivo?.trim() ? { motivo: motivo.trim() } : {}),
  });
  return response.data.data.publicacion;
};
