import { api } from "./api";

export const get_publication_archives =
  async (
    publication_id: string
  ) => {

    const response =
      await api.get(

        `/publicaciones/${publication_id}/archivos`

      );

    return response.data;
  };