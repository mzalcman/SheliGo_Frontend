import type { UserRole } from "../user";
import type { AdminPublicationState, AdminPublicationType } from "./admin_publication";

export interface AdminUserInstitution {
  id: string;
  nombre: string;
  es_admin: boolean;
  fecha_union?: string | null;
}

export interface AdminUser {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: UserRole;
  foto: string;
  created_at: string | null;
  instituciones: AdminUserInstitution[];
  publicaciones_count: number;
}

export interface AdminUserDetail extends Omit<AdminUser, "publicaciones_count"> {
  updated_at: string | null;
  publicaciones_resumen: { activas: number; recuperadas: number; eliminadas: number };
  publicaciones_recientes: {
    id: string;
    nombre: string;
    tipo: AdminPublicationType;
    estado: AdminPublicationState;
    created_at: string;
    institucion_nombre: string | null;
  }[];
}

export interface AdminUserFilters {
  rol?: UserRole;
  institucion_id?: string;
}
