import { api } from "./api";

export const get_home_user =
  async () => {

    const response =
      await api.get(
        "/home/usuario"
      );

    return response.data;
};

export const get_home_publications =
  async () => {

    const response =
      await api.get(
        "/home/publicaciones"
      );

    return response.data;
  };

export const get_home_institutions =
  async () => {

    const response =
      await api.get(
        "/home/instituciones"
      );

    return response.data;
  };