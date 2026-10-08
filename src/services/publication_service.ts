import { api } from "./api";
import type { PublicationState } from "../types/publication";

export const get_publication_by_id = async (id: string) => {
  const response = await api.get(`/publicaciones/${id}`);
  return response.data.data.publicacion;
};

export const get_my_publications = async () => {
  const response = await api.get("/publicaciones/mias");
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categorias");
  return response.data;
};

export const getInstitutions = async () => {
  const response = await api.get("/instituciones");
  return response.data;
};

export const create_publication = async (formData: FormData) => {
  const response = await api.post("/publicaciones", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data.publicacion;
};

export const update_publication = async (id: string, formData: FormData) => {
  const response = await api.put(`/publicaciones/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

/* Cambio de estado por el dueño, con los endpoints existentes:
   - recuperada → PATCH /publicaciones/:id/recuperar
   - activa     → PUT /publicaciones/:id (solo el campo estado)
   La baja ("eliminada") va por delete_publication, que es lógica en el backend. */
export const update_publication_state = async (
  id: string,
  estado: Exclude<PublicationState, "eliminada">
) => {
  if (estado === "recuperada") {
    const response = await api.patch(`/publicaciones/${id}/recuperar`);
    return response.data.data.publicacion;
  }
  const formData = new FormData();
  formData.append("estado", estado);
  const response = await update_publication(id, formData);
  return response.data.publicacion;
};

export const delete_publication = async (id: string) => {
  const response = await api.delete(`/publicaciones/${id}`);
  return response.data;
};

export const get_publication_photos = async (id: string) => {
  const response = await api.get(`/publicaciones/${id}/archivos`);
  return response.data?.data?.archivos || response.data?.archivos || [];
};