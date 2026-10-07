import type { UserRole } from "../user";

export type AdminRole = Exclude<UserRole, "user">;

/* Permisos calculados por el backend para dibujar la interfaz.
   No reemplazan la validación de la API: solo evitan mostrar acciones que darían 403. */
export interface AdminPermissions {
  usuarios: { ver: boolean; cambiar_rol: boolean; gestionar_instituciones: boolean };
  publicaciones: { ver: boolean; moderar: boolean };
  instituciones: { ver: boolean; crear: boolean; editar: boolean; eliminar: boolean };
  categorias: { ver: boolean; gestionar: boolean };
}

export interface AdminSession {
  usuario: {
    id: string;
    nombre: string;
    apellido: string | null;
    email: string;
    foto: string;
    rol: AdminRole;
  };
  es_global: boolean;
  // Instituciones administradas (vacío para el admin general, que administra todas)
  instituciones: { id: string; nombre: string }[];
  permisos: AdminPermissions;
}
