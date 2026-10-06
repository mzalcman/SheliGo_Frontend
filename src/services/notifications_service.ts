import { api } from "./api";

export const get_notifications = async () => {
  const response = await api.get("/notificaciones");
  return response.data?.notificaciones || response.data;
};

export const mark_as_read = async (notificationId: string) => {
  const response = await api.patch(`/notificaciones/${notificationId}/leer`);
  return response.data;
};

/* Normaliza las distintas formas de respuesta del backend a un array. */
export const extract_notifications = (res: any): any[] => {
  const list =
    res?.data?.notificaciones ||
    res?.notificaciones ||
    res?.data ||
    (Array.isArray(res) ? res : []);

  return Array.isArray(list) ? list : [];
};

/* Evento para avisar al header que cambió el estado de lectura. */
export const NOTIFICATIONS_UPDATED_EVENT = "sheligo:notifications-updated";

export const notify_notifications_updated = () => {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};
