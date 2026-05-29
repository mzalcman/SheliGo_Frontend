import { api } from "./api";

export const get_publication_by_id =
  async (
    id: number
  ) => {

    const response =
      await api.get(
        `/publicaciones/${id}`
      );

    return response.data;
  };