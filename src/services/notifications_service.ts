import { api } from "./api";

export interface NotificationItem {
  id: string;
  usuario_id: string;
  publicacion_id?: string | null;
  titulo: string;
  contenido: string;
  tipo: string;
  leida: boolean;
  created_at: string;
  updated_at?: string;
}

export const get_notifications = async (): Promise<
  NotificationItem[]
> => {
  const response = await api.get(
    "/notificaciones"
  );

  return (
    response.data?.data?.notificaciones ?? []
  );
};

export const mark_as_read = async (
  notificationId: string
) => {
  const response = await api.patch(
    `/notificaciones/${notificationId}/leida`
  );

  return response.data;
};

export const mark_all_as_read = async () => {
  console.log("MARCAR TODAS: enviando petición");

  try {
    const response = await api.patch(
      "/notificaciones/leidas"
    );

    console.log(
      "MARCAR TODAS: respuesta",
      response.status,
      response.data
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "MARCAR TODAS: ERROR",
      error
    );

    console.error(
      "STATUS:",
      error?.response?.status
    );

    console.error(
      "DATA:",
      error?.response?.data
    );

    throw error;
  }
};