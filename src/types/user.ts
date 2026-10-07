export interface UserInstitution {
  id: string | number;
  nombre: string;
  direccion?: string;
  foto?: string;
}

/* Roles definidos en el backend. Solo se usan para mostrar u ocultar
   accesos: los permisos reales los valida la API en cada request. */
export type UserRole = "user" | "institution_admin" | "admin";

export interface User {
  id: string;
  rol?: UserRole;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  foto: string;
  instituciones?: UserInstitution[];
  name?: string;
  profile_image?: string;
}