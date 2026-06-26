import { api } from "./api";

export const get_publication_by_id =
  async (
    id: string
  ) => {

    const response =
      await api.get(
        `/publicaciones/${id}`
      );

    return response.data.data.publicacion;
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