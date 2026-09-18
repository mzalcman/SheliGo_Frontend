export interface UserInstitution {
  id: string | number;
  nombre: string;
  direccion?: string;
  foto?: string;
}

export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  foto: string;
  instituciones?: UserInstitution[];
  name?: string;
  profile_image?: string;
}