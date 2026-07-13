import { api } from "./api";

export const get_home_publications =
  async () => {

    const response =
      await api.get(
        "/publicaciones/recientes"
      );

    return response.data;
  };

export const get_home_institutions =
  async () => {

    const response =
      await api.get(
        "/instituciones/recientes"
      );

    return response.data;
  };