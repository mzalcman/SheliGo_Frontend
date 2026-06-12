import { api } from "./api";

export const get_publication_by_id =
  async (
    id: string
  ) => {

    const response =
      await api.get(
        `/publicaciones/${id}`
      );

    return response.data;
  };

export const create_publication =
  async (
    formData: FormData
  ) => {

    const response =
      await api.post(
        "/publicaciones",
        formData
      );

    return response.data;
  };