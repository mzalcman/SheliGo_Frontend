import { api } from "./api";

export const get_notifications = async () => {
  const response = await api.get("/notificaciones");
  return response.data?.notificaciones || response.data;
};

export const mark_as_read = async (notificationId: string) => {
  const response = await api.patch(`/notificaciones/${notificationId}/leer`);
  return response.data;
};