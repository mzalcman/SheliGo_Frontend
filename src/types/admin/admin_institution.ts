export interface AdminInstitution {
  id: string;
  nombre: string;
  email: string | null;
  direccion: string | null;
  telefono: string | null;
  foto: string | null;
  latitud: number | null;
  longitud: number | null;
  created_at: string | null;
  miembros_count: number;
  admins_count: number;
  publicaciones_activas: number;
  publicaciones_total: number;
}

export interface AdminInstitutionDetail extends Omit<AdminInstitution, "admins_count"> {
  publicaciones_recuperadas: number;
  administradores: { id: string; nombre: string; apellido: string | null; email: string }[];
}

/* Campos del formulario. '' en un campo opcional significa "sin valor". */
export interface AdminInstitutionForm {
  nombre: string;
  email: string;
  direccion: string;
  telefono: string;
  latitud: string;
  longitud: string;
}
