import { api } from "../api";
import type { AdminDashboard } from "../../types/admin/admin_dashboard";

export const get_admin_dashboard = async (signal?: AbortSignal): Promise<AdminDashboard> => {
  const response = await api.get("/admin/dashboard", { signal });
  return response.data.data;
};
