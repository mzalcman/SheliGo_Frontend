import { api } from "../api";
import type { AdminSession } from "../../types/admin/admin_session";

// Valida en el backend que el usuario logueado puede usar el backoffice
export const get_admin_session = async (): Promise<AdminSession> => {
  const response = await api.get("/admin/me");
  return response.data.data;
};
