export interface AdminCategory {
  id: string;
  nombre: string;
  descripcion: string | null;
  publicaciones_activas: number;
  publicaciones_total: number;
}

export interface AdminCategoryForm {
  nombre: string;
  descripcion: string;
}
