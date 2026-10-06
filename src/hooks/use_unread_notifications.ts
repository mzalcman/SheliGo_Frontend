import { useEffect, useState } from "react";
import {
  get_notifications,
  extract_notifications,
  NOTIFICATIONS_UPDATED_EVENT,
} from "../services/notifications_service";

const POLL_INTERVAL_MS = 30000;

/* Cantidad de notificaciones no leídas del usuario logueado.
   Se actualiza periódicamente y cuando la página de notificaciones
   marca alguna como leída. */
export const useUnreadNotifications = () => {
  const [unread_count, set_unread_count] = useState(0);

  useEffect(() => {
    let is_mounted = true;

    const fetch_unread = async () => {
      if (!localStorage.getItem("token")) return;

      try {
        const res = await get_notifications();
        const count = extract_notifications(res).filter((item) => !item?.leida).length;
        if (is_mounted) set_unread_count(count);
      } catch (error) {
        console.error("No se pudo obtener el contador de notificaciones:", error);
      }
    };

    fetch_unread();
    const interval = setInterval(fetch_unread, POLL_INTERVAL_MS);
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, fetch_unread);

    return () => {
      is_mounted = false;
      clearInterval(interval);
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, fetch_unread);
    };
  }, []);

  return unread_count;
};
