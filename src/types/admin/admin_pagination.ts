/* Respuesta paginada estándar de la API /admin */
export interface AdminPaginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AdminListParams {
  page: number;
  limit: number;
  search?: string;
}
