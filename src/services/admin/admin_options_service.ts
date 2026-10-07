import { api } from "../api";

export interface AdminOption {
  id: string;
  nombre: string;
}

/* Opciones para filtros y formularios. Usan los endpoints públicos que ya
   existían (solo id y nombre), así no se duplican rutas en /admin. */
export const get_institution_options = async (): Promise<AdminOption[]> => {
  const response = await api.get("/instituciones/selector");
  return response.data.data.instituciones;
};

export const get_category_options = async (): Promise<AdminOption[]> => {
  const response = await api.get("/categorias");
  return response.data.data.categorias;
};
