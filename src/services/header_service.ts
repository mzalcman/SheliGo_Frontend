import { api } from "./api";

/* Trae usuario logueado para header. */

export const get_header_data =
  async () => {

    const response =
      await api.get("/header");

    return response.data;
  };