import { ROLE_LABELS, STATE_LABELS } from "../../../components/admin/admin_badge/admin_labels";
import type { AdminActivity } from "../../../types/admin/admin_dashboard";
import type { AdminPublicationState } from "../../../types/admin/admin_publication";
import type { UserRole } from "../../../types/user";

const text = (value: unknown) => (typeof value === "string" && value ? value : "");

// Traduce un registro de auditoria_admin a una frase legible
export const describe_activity = (activity: AdminActivity): string => {
  const d = activity.detalle ?? {};
  const name = text(d.nombre) || text(d.nombre_nuevo) || text(d.email);

  switch (activity.accion) {
    case "usuario.cambiar_rol":
      return `cambió el rol de ${text(d.email)} a ${ROLE_LABELS[d.rol_nuevo as UserRole] ?? text(d.rol_nuevo)}`;
    case "usuario.cambiar_instituciones":
      return `actualizó las instituciones de ${text(d.email)}`;
    case "publicacion.eliminar":
      return `eliminó la publicación "${name}"`;
    case "publicacion.restaurar":
      return `restauró la publicación "${name}"`;
    case "publicacion.cambiar_estado":
      return `marcó "${name}" como ${(STATE_LABELS[d.estado_nuevo as AdminPublicationState] ?? text(d.estado_nuevo)).toLowerCase()}`;
    case "institucion.crear":
      return `creó la institución "${name}"`;
    case "institucion.editar":
      return `editó la institución "${name}"`;
    case "institucion.eliminar":
      return `eliminó la institución "${name}"`;
    case "categoria.crear":
      return `creó la categoría "${name}"`;
    case "categoria.editar":
      return `editó la categoría "${name}"`;
    case "categoria.eliminar":
      return `eliminó la categoría "${name}"`;
    default:
      return activity.accion;
  }
};
