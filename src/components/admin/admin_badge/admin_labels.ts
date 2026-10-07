import type { UserRole } from "../../../types/user";
import type { AdminPublicationState } from "../../../types/admin/admin_publication";

export const ROLE_LABELS: Record<UserRole, string> = {
  user: "Usuario",
  institution_admin: "Admin institucional",
  admin: "Admin general",
};

export const STATE_LABELS: Record<AdminPublicationState, string> = {
  activa: "Activa",
  recuperada: "Recuperada",
  eliminada: "Eliminada",
};
