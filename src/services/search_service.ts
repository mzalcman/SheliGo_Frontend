import { api } from "./api";

export const searchPublications = async (filters: {
  busqueda?: string;
  categoria_id?: string;
  institucion_id?: string;
  lugar_institucion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo?: string;
}) => {

  const response = await api.get(
    "/publicaciones/search",
    {
      params: filters,
    }
  );

  return response.data.data.publicaciones;
};