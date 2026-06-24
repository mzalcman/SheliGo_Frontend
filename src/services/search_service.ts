import { api } from "./api";

export const search_publications = async (filters: {
    busqueda?: string;
    categoria_id?: string;
    institucion_id?: string;
    lugar_institucion?: string;
    fecha?: string;
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