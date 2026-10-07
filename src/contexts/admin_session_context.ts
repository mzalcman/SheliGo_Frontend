import { createContext } from "react";
import type { AdminSession } from "../types/admin/admin_session";
import type { AdminToastTone } from "../components/admin/admin_toast/admin_toast";

export interface AdminSessionContextValue {
  session: AdminSession;
  // Avisos breves de éxito o error después de una acción
  notify: (message: string, tone?: AdminToastTone) => void;
}

/* Sesión del backoffice: la obtiene admin_route desde GET /admin/me.
   Los permisos sirven para dibujar la interfaz; la API los vuelve a validar siempre. */
export const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);
