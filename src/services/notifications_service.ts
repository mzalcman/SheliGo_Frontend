import { api } from "./api";
import type { NotificationItem } from "../types/notification";

export const get_notifications = async () => {
  const response = await api.get("/notificaciones");
  return response.data?.notificaciones || response.data;
};

export const mark_as_read = async (notificationId: string) => {
  const response = await api.patch(`/notificaciones/${notificationId}/leida`);
  return response.data;
};

export const mark_all_as_read = async () => {
  const response = await api.patch("/notificaciones/leidas");
  return response.data;
};

/* Normaliza las distintas formas de respuesta del backend a un array. */
export const extract_notifications = (res: unknown): NotificationItem[] => {
  if (Array.isArray(res)) return res;
  const body = res as {
    notificaciones?: unknown;
    data?: { notificaciones?: unknown } | unknown[];
  } | null;
  const data = body?.data;
  const list =
    (data && !Array.isArray(data) ? data.notificaciones : undefined) ??
    body?.notificaciones ??
    data;

  return Array.isArray(list) ? (list as NotificationItem[]) : [];
};

/* Evento para avisar al header que cambió el estado de lectura. */
export const NOTIFICATIONS_UPDATED_EVENT = "sheligo:notifications-updated";

export const notify_notifications_updated = () => {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
};
